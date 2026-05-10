// utils/getFilterKeys.ts

/**
 * Returns all keys from a parsed schema object that are not pagination keys.
 * Useful for deriving filter keys dynamically without hardcoding field names.
 *
 * @example
 * const defaultValues = accountsFilterSchema.parse({})
 * const filterKeys = getFilterKeys(defaultValues)
 * // => ["q", "accountGroupType", "isActive"]
 *
 * @example custom pagination keys
 * const filterKeys = getFilterKeys(defaultValues, ["page", "pageSize", "cursor"])
 * // => ["q", "accountGroupType", "isActive"]
 */
export function getFilterKeys<T extends Record<string, unknown>>(
  defaults: T,
  paginationKeys: (keyof T)[] = ["page", "pageSize"]
): (keyof T)[] {
  return Object.keys(defaults).filter((key) => !paginationKeys.includes(key as keyof T)) as (keyof T)[]
}
