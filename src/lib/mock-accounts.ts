// mock-accounts.ts — Simulates an API response of client accounts.
// The API only returns accountNumber, companyCode, and principalPartyName.
// All other SSI details (beneficiary name, BIC, currency, etc.) are filled
// manually by the user during the Initiation stage.

export interface MockAccount {
  accountNumber: string
  companyCode: string
  principalPartyName: string
}

const PARTY_MAP: Record<string, string> = {
  "100": "Acme Global Holdings",
  "200": "Meridian Capital Partners",
  "300": "Pacific Rim Industries",
  "400": "Sterling Financial Group",
  "500": "Nordic Trade Solutions"
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  // Acme Global Holdings (100)
  { accountNumber: "100-234-5678", companyCode: "ACME01", principalPartyName: "Acme Global Holdings" },
  { accountNumber: "100-345-6789", companyCode: "ACME02", principalPartyName: "Acme Global Holdings" },
  { accountNumber: "100-456-7890", companyCode: "ACME03", principalPartyName: "Acme Global Holdings" },

  // Meridian Capital Partners (200)
  { accountNumber: "200-111-2222", companyCode: "MERI01", principalPartyName: "Meridian Capital Partners" },
  { accountNumber: "200-222-3333", companyCode: "MERI02", principalPartyName: "Meridian Capital Partners" },
  { accountNumber: "200-333-4444", companyCode: "MERI03", principalPartyName: "Meridian Capital Partners" },

  // Pacific Rim Industries (300)
  { accountNumber: "300-555-6666", companyCode: "PACI01", principalPartyName: "Pacific Rim Industries" },
  { accountNumber: "300-666-7777", companyCode: "PACI02", principalPartyName: "Pacific Rim Industries" },
  { accountNumber: "300-777-8888", companyCode: "PACI03", principalPartyName: "Pacific Rim Industries" },

  // Sterling Financial Group (400)
  { accountNumber: "400-888-9999", companyCode: "STER01", principalPartyName: "Sterling Financial Group" },
  { accountNumber: "400-999-0000", companyCode: "STER02", principalPartyName: "Sterling Financial Group" },
  { accountNumber: "400-123-4567", companyCode: "STER03", principalPartyName: "Sterling Financial Group" },

  // Nordic Trade Solutions (500)
  { accountNumber: "500-234-5678", companyCode: "NORD01", principalPartyName: "Nordic Trade Solutions" },
  { accountNumber: "500-345-6789", companyCode: "NORD02", principalPartyName: "Nordic Trade Solutions" },
  { accountNumber: "500-456-7890", companyCode: "NORD03", principalPartyName: "Nordic Trade Solutions" }
]

/**
 * Extract the party prefix (first 3 digits) from an account number.
 */
export function getPartyPrefix(accountNumber: string): string {
  return accountNumber.slice(0, 3)
}

/**
 * Resolve the principal party name from an account number's prefix.
 */
export function getPartyNameByPrefix(accountNumber: string): string | null {
  return PARTY_MAP[getPartyPrefix(accountNumber)] ?? null
}
