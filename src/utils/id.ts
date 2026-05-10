import { customAlphabet } from "nanoid"

const uppercaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
const numericAlphabet = "0123456789"

const generateNumericId = customAlphabet(numericAlphabet, 10)

/**
 * Generates a random ID using nanoid with customizable options.
 *
 * @param options - Configuration options for ID generation
 * @param options.prefix - Optional prefix for the ID (will be converted to lowercase by default, uppercase if uppercase=true)
 * @param options.precision - Length of the random ID part (default: 12)
 * @param options.uppercase - If true, generates uppercase IDs; if false, generates lowercase IDs (default: false, lowercase)
 *
 * @returns A randomly generated ID string
 *
 * @example
 * ```ts
 * generateId() // "abcd123456" (lowercase by default)
 * generateId({ prefix: "fd" }) // "fd_abcd123456" (lowercase with prefix)
 * generateId({ precision: 5 }) // "abcd1" (5 chars, lowercase)
 * generateId({ prefix: "SAV", precision: 8 }) // "sav_abcd1234" (8 chars with prefix, lowercase)
 * generateId({ uppercase: true }) // "ABCD123456" (uppercase)
 * generateId({ prefix: "fd", uppercase: true }) // "FD_ABCD123456" (uppercase with prefix)
 * ```
 */
export const generateId = (options?: { prefix?: string; precision?: number; uppercase?: boolean }): string => {
  const precision = options?.precision ?? 12
  const alphabet = options?.uppercase ? uppercaseAlphabet : lowercaseAlphabet
  const nanoid = customAlphabet(alphabet, precision)
  const id = nanoid()

  if (options?.prefix) {
    const prefix = options.uppercase ? options.prefix.toUpperCase() : options.prefix.toLowerCase()
    return `${prefix}_${id}`
  }

  return id
}

/**
 * Generates a unique account number in format: YYMM + 10 random digits
 * This gives 10 billion combinations per month - safe for SaaS.
 *
 * @returns A 14-character numeric account number string
 *
 * @example
 * ```ts
 * generateAccountNumber() // "26010948271635" (January 2026 + 10 random digits)
 * ```
 */
export function generateAccountNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  return `${year}${month}${generateNumericId()}`
}
