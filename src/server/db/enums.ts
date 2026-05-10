function createEnum<T extends Record<string, string>>(values: T) {
  const valuesArray = Object.values(values)
  return {
    values: values,
    array: valuesArray as unknown as readonly [T[keyof T], ...T[keyof T][]],
    type: null as unknown as T[keyof T]
  }
}

// ITEM TYPE
export const ITEM_TYPE_ENUM = createEnum({
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE"
} as const)

// MEMBER STATUS
export const MEMBER_STATUS_ENUM = createEnum({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  WITHDRAWN: "WITHDRAWN"
} as const)

// GENDER
export const GENDER_ENUM = createEnum({
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER"
} as const)

// ACCOUNT GROUP TYPE
export const ACCOUNT_GROUP_TYPE_ENUM = createEnum({
  ASSET: "ASSET",
  LIABILITY: "LIABILITY",
  EQUITY: "EQUITY",
  INCOME: "INCOME",
  EXPENSE: "EXPENSE"
} as const)

// BANK ACCOUNT TYPE
export const BANK_ACCOUNT_TYPE_ENUM = createEnum({
  SAVINGS: "SAVINGS",
  CURRENT: "CURRENT",
  OVERDRAFT: "OVERDRAFT"
} as const)

// DOCUMENT STATUS
export const DOCUMENT_STATUS_ENUM = createEnum({
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED"
} as const)

// TAX TYPE
export const TAX_TYPE_ENUM = createEnum({
  INCLUSIVE: "INCLUSIVE",
  EXCLUSIVE: "EXCLUSIVE"
} as const)

// DISCOUNT TYPE
export const DISCOUNT_TYPE_ENUM = createEnum({
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED"
} as const)

// VOUCHER TYPE
export const VOUCHER_TYPE_ENUM = createEnum({
  RECEIPT: "RECEIPT",
  PAYMENT: "PAYMENT",
  CONTRA: "CONTRA",
  JOURNAL: "JOURNAL",
  SALE: "SALE",
  PURCHASE: "PURCHASE",
  OPENING_BALANCE: "OPENING_BALANCE",
  CREDIT_NOTE: "CREDIT_NOTE"
} as const)

// SHARE TYPE
export const SHARE_TYPE_ENUM = createEnum({
  PURCHASE: "PURCHASE",
  WITHDRAWAL: "WITHDRAWAL"
} as const)

// SAVING INTEREST CALCULATION
export const SAVING_INTEREST_CALC_ENUM = createEnum({
  DAILY: "DAILY",
  MONTHLY: "MONTHLY"
} as const)

// INVENTORY TRANSACTION TYPE
export const INVENTORY_TRANSACTION_TYPE_ENUM = createEnum({
  OPENING_STOCK: "OPENING_STOCK",
  PURCHASE: "PURCHASE",
  SALE: "SALE",
  SALE_RETURN: "SALE_RETURN",
  PURCHASE_RETURN: "PURCHASE_RETURN",
  ADJUSTMENT_ADD: "ADJUSTMENT_ADD",
  ADJUSTMENT_REDUCE: "ADJUSTMENT_REDUCE",
  DAMAGE: "DAMAGE",
  TRANSFER_IN: "TRANSFER_IN",
  TRANSFER_OUT: "TRANSFER_OUT"
} as const)

// Convenience exports
export const ITEM_TYPE = ITEM_TYPE_ENUM.values
export const MEMBER_STATUS = MEMBER_STATUS_ENUM.values
export const GENDER = GENDER_ENUM.values
export const ACCOUNT_GROUP_TYPE = ACCOUNT_GROUP_TYPE_ENUM.values
export const BANK_ACCOUNT_TYPE = BANK_ACCOUNT_TYPE_ENUM.values
export const DOCUMENT_STATUS = DOCUMENT_STATUS_ENUM.values
export const TAX_TYPE = TAX_TYPE_ENUM.values
export const DISCOUNT_TYPE = DISCOUNT_TYPE_ENUM.values
export const VOUCHER_TYPE = VOUCHER_TYPE_ENUM.values
export const SHARE_TYPE = SHARE_TYPE_ENUM.values
export const SAVING_INTEREST_CALC = SAVING_INTEREST_CALC_ENUM.values
export const INVENTORY_TRANSACTION_TYPE = INVENTORY_TRANSACTION_TYPE_ENUM.values

// Type exports
export type ItemType = typeof ITEM_TYPE_ENUM.type
export type MemberStatus = typeof MEMBER_STATUS_ENUM.type
export type Gender = typeof GENDER_ENUM.type
export type AccountGroupType = typeof ACCOUNT_GROUP_TYPE_ENUM.type
export type BankAccountType = typeof BANK_ACCOUNT_TYPE_ENUM.type
export type DocumentStatus = typeof DOCUMENT_STATUS_ENUM.type
export type TaxType = typeof TAX_TYPE_ENUM.type
export type DiscountType = typeof DISCOUNT_TYPE_ENUM.type
export type VoucherType = typeof VOUCHER_TYPE_ENUM.type
export type ShareType = typeof SHARE_TYPE_ENUM.type
export type SavingInterestCalc = typeof SAVING_INTEREST_CALC_ENUM.type
export type InventoryTransactionType = typeof INVENTORY_TRANSACTION_TYPE_ENUM.type
