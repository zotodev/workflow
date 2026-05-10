import { customType, text } from "drizzle-orm/pg-core"
import { customAlphabet } from "nanoid"

// type PrefixedId<Prefix extends string> = `${Prefix}_${string}`

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21)

// const generateResourceId = <Prefix extends string>(prefix: Prefix): PrefixedId<Prefix> => {
//   return `${prefix}_${nanoid()}`
// }

/**
 * @returns {string} A prefixed ID like "org_abc123"
 */

const generateResourceId = (prefix: string): string => {
  return `${prefix}_${nanoid()}`
}

/**
 * Creates a resource ID column that stores plain string values.
 * @param prefix - ID prefix like "org" or "user"
 * @param dbName - Simple column name like "id"
 * @example
 * // Stores strings like "org_abc123"
 * id: resourceId("org", "id")
 * // Filter with plain string:
 * where(eq(table.id, "org_abc123"))
 */
export const resourceId = <Name extends string, Prefix extends string>(prefix: Prefix, dbName?: Name) =>
  customType<{
    data: string
    driverData: string
  }>({
    dataType: () => "text",
    fromDriver: (value) => value,
    toDriver: (value) => value
  })<Name>(dbName!).$defaultFn(() => generateResourceId(prefix))

type NumericConfig = {
  precision?: number
  scale?: number
}

export const numericCasted = customType<{
  data: number
  driverData: string
  config: NumericConfig
}>({
  dataType: (config) => {
    if (config?.precision && config?.scale) {
      return `numeric(${config.precision}, ${config.scale})`
    }
    return "numeric"
  },
  fromDriver: (value: string) => Number.parseFloat(value),
  toDriver: (value: number) => value.toString()
})

export const tsvector = customType<{
  data: string
}>({
  dataType() {
    return "tsvector"
  }
})

export function enumColumn<T extends string>(
  name: string,
  _enumArray: readonly T[],
  options?: {
    default?: T
    nullable?: boolean
  }
) {
  let column = text(name).$type<T>()

  if (!options?.nullable) {
    column = column.notNull() as typeof column
  }

  if (options?.default) {
    column = column.default(options.default) as typeof column
  }

  return column
}
