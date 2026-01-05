import { decodeProtobufMessage, extractTextFromBase64 } from "./encoding"

export async function fetchUserTimezone(): Promise<string> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    return data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (err) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export function formatTimestampInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  return formatter.format(date)
}

export async function compileCode(code: string, senderAddress?: string, timeoutMs = 60000) {
  const url = "https://movement-sqto.onrender.com/compile"

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        ...(senderAddress ? { sender_address: senderAddress } : {}),
      }),
      signal: controller.signal,
    })

    const text = await resp.text()
    if (!resp.ok) {
      try {
        const parsed = JSON.parse(text)
        throw new Error(typeof parsed === "string" ? parsed : JSON.stringify(parsed))
      } catch (e) {
        throw new Error(text || resp.statusText)
      }
    }

    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out')
    throw err
  } finally {
    clearTimeout(id)
  }
}

/**
 * Decode a Base64-encoded protobuf response and extract the text field.
 * Use this when the API returns a protobuf Message with a text field.
 * @param base64Response - The Base64 encoded protobuf string from the API
 * @returns The decoded text string from the Message.text field
 */
export async function decodeCompileResponse(base64Response: string): Promise<string> {
  try {
    // First try standard protobuf decoding for simple Message { text: string }
    return await decodeProtobufMessage(base64Response)
  } catch {
    // Fallback: extract embedded text from complex protobuf structures
    const extracted = extractTextFromBase64(base64Response)
    if (extracted) return extracted
    throw new Error("Failed to decode protobuf message")
  }
}

/**
 * Compile code and decode the protobuf response to extract the text field.
 * @param code - The code to compile
 * @param senderAddress - Optional sender address
 * @param timeoutMs - Request timeout in milliseconds
 * @returns The decoded text from the protobuf response
 */
export async function compileAndDecode(code: string, senderAddress?: string, timeoutMs = 60000): Promise<string> {
  const response = await compileCode(code, senderAddress, timeoutMs)
  const base64String = typeof response === "string" ? response : JSON.stringify(response)
  return decodeCompileResponse(base64String)
}
