import protobuf from "protobufjs"

export function decodeBase64ToUint8Array(base64: string): Uint8Array {
  // browser-friendly base64 -> Uint8Array
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// Define the Message proto schema inline
const messageProtoSchema = `
syntax = "proto3";

message Message {
  string text = 1;
}
`

let MessageType: protobuf.Type | null = null

async function getMessageType(): Promise<protobuf.Type> {
  if (MessageType) return MessageType
  const root = protobuf.parse(messageProtoSchema).root
  MessageType = root.lookupType("Message")
  return MessageType
}

/**
 * Decode a Base64-encoded protobuf message and extract the text field.
 * @param base64String - The Base64 encoded protobuf data
 * @returns The extracted text string from the Message.text field
 */
export async function decodeProtobufMessage(base64String: string): Promise<string> {
  const bytes = decodeBase64ToUint8Array(base64String)
  const Message = await getMessageType()
  const decoded = Message.decode(bytes)
  const obj = Message.toObject(decoded, { defaults: true })
  return obj.text || ""
}

/**
 * Extract user-defined string content from Move compiled bytecode.
 * Move bytecode stores strings with a length prefix byte followed by the string bytes.
 * This function finds and extracts meaningful string literals from the bytecode.
 * @param base64String - The Base64 encoded bytecode
 * @returns The extracted user string, or null if not found
 */
export function extractTextFromBase64(base64String: string): string | null {
  const bytes = decodeBase64ToUint8Array(base64String)
  
  // Look for length-prefixed strings in the bytecode
  // Move stores strings as: [length byte] [string bytes...]
  const foundStrings: string[] = []
  
  for (let i = 0; i < bytes.length - 1; i++) {
    const possibleLength = bytes[i]
    
    // Skip if length is 0, too short, or would exceed buffer
    if (possibleLength < 3 || possibleLength > 200 || i + 1 + possibleLength > bytes.length) {
      continue
    }
    
    // Check if the next `possibleLength` bytes are all printable ASCII
    let isPrintable = true
    let hasLetter = false
    
    for (let j = 0; j < possibleLength; j++) {
      const byte = bytes[i + 1 + j]
      // Printable ASCII range (space to ~)
      if (byte < 32 || byte > 126) {
        isPrintable = false
        break
      }
      // Check if it has at least one letter
      if ((byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122)) {
        hasLetter = true
      }
    }
    
    if (isPrintable && hasLetter) {
      const str = new TextDecoder().decode(bytes.slice(i + 1, i + 1 + possibleLength))
      // Skip known Move keywords/identifiers that are part of the module structure
      const skipKeywords = ['message', 'Message', 'text', 'String', 'string', 'init', 'utf8', 'compilation_metadata']
      if (!skipKeywords.includes(str) && !str.match(/^[0-9.]+$/)) {
        foundStrings.push(str)
      }
    }
  }
  
  // Return the longest user-defined string found (likely the actual content)
  if (foundStrings.length > 0) {
    return foundStrings.reduce((a, b) => a.length >= b.length ? a : b)
  }
  
  return null
}
