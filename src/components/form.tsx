import { CalendarIcon } from "lucide-react"
import { type ComponentProps, type ReactNode, useState } from "react"
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form"
import { Calendar } from "./ui/calendar"
import { Checkbox } from "./ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./ui/input-group"
import { PasswordInput } from "./ui/password-input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = {
  name: TName
  label: ReactNode
  description?: ReactNode
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"]
}

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean
  controlFirst?: boolean
  children: (
    field: Parameters<ControllerProps<TFieldValues, TName, TTransformedValues>["render"]>[0]["field"] & {
      "aria-invalid": boolean
      id: string
    }
  ) => ReactNode
}

type FormControlFunc<ExtraProps extends Record<string, unknown> = Record<never, never>> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>(
  props: FormControlProps<TFieldValues, TName, TTransformedValues> & ExtraProps
) => ReactNode

function FormBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>({
  children,
  control,
  label,
  name,
  description,
  controlFirst,
  horizontal
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </>
        )
        const control = children({
          ...field,
          id: field.name,
          "aria-invalid": fieldState.invalid
        })
        const errorElem = fieldState.invalid && <FieldError errors={[fieldState.error]} />

        return (
          <Field data-invalid={fieldState.invalid} orientation={horizontal ? "horizontal" : undefined}>
            {controlFirst ? (
              <>
                {control}
                <FieldContent>
                  {labelElement}
                  {errorElem}
                </FieldContent>
              </>
            ) : (
              <>
                <FieldContent>{labelElement}</FieldContent>
                {control}
                {errorElem}
              </>
            )}
          </Field>
        )
      }}
    />
  )
}

export const FormInput: FormControlFunc<Omit<ComponentProps<"input">, "name" | "defaultValue" | "value">> = ({
  onBlur,
  onChange,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <Input
          {...props}
          {...field}
          onBlur={(e) => {
            field.onBlur()
            onBlur?.(e)
          }}
          onChange={(e) => {
            field.onChange(e)
            onChange?.(e)
          }}
        />
      )}
    </FormBase>
  )
}

export const FormTextarea: FormControlFunc<Omit<ComponentProps<"textarea">, "name" | "defaultValue" | "value">> = ({
  onBlur,
  onChange,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <Textarea
          {...props}
          {...field}
          onBlur={(e) => {
            field.onBlur()
            onBlur?.(e)
          }}
          onChange={(e) => {
            field.onChange(e)
            onChange?.(e)
          }}
        />
      )}
    </FormBase>
  )
}

export const FormSelect: FormControlFunc<{
  children: ReactNode
  disabled?: boolean
  items?: Array<{ value: string; label: string }>
}> = ({ children, disabled, items, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <Select {...field} onValueChange={onChange} disabled={disabled} items={items}>
          <SelectTrigger aria-invalid={field["aria-invalid"]} id={field.id} onBlur={onBlur} disabled={disabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    </FormBase>
  )
}

export const FormCheckbox: FormControlFunc = (props) => {
  return (
    <FormBase {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => <Checkbox {...field} checked={value} onCheckedChange={onChange} />}
    </FormBase>
  )
}

export const FormPasswordInput: FormControlFunc<Omit<ComponentProps<"input">, "name" | "defaultValue" | "value">> = ({
  onBlur,
  onChange,
  ...props
}) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <PasswordInput
          {...props}
          {...field}
          onBlur={(e) => {
            field.onBlur()
            onBlur?.(e)
          }}
          onChange={(e) => {
            field.onChange(e)
            onChange?.(e)
          }}
        />
      )}
    </FormBase>
  )
}

export const FormDatePicker: FormControlFunc<{ placeholder?: string; disabled?: boolean }> = ({
  placeholder = "Select a date",
  disabled,
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date | undefined>(undefined)

  return (
    <FormBase {...props}>
      {({ onChange, value, "aria-invalid": ariaInvalid, id }) => {
        const selectedDate = value ? new Date(value) : undefined
        const displayValue = selectedDate
          ? selectedDate.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })
          : ""

        return (
          <InputGroup>
            <InputGroupInput
              id={id}
              value={displayValue}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              aria-invalid={ariaInvalid}
              onClick={() => !disabled && setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setOpen(true)
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={
                    <InputGroupButton variant="ghost" size="icon-xs" aria-label="Select date" disabled={disabled} />
                  }
                >
                  <CalendarIcon />
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={(date) => {
                      if (date) {
                        const y = date.getFullYear()
                        const m = String(date.getMonth() + 1).padStart(2, "0")
                        const d = String(date.getDate()).padStart(2, "0")
                        onChange(`${y}-${m}-${d}`)
                        setMonth(date)
                      }
                      setOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
        )
      }}
    </FormBase>
  )
}
