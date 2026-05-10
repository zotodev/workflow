---
name: app-forms
description: Build forms in this project using React Hook Form + Zod with the helper components from src/components/form.tsx (FormInput, FormTextarea, FormSelect, FormCheckbox, SubmitButton). Use when users need to create, update, or wire up any form in this codebase.
---

## Forms Pattern

Use the form helper components from `src/components/form.tsx`. Always use React Hook Form + Zod for all forms in this project.

```typescript
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from "@/components/form"
import { SelectItem } from "@/components/ui/select"
import { SubmitButton } from "@/components/ui/submit-button"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string(),
  isActive: z.boolean()
})

function ProductForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", category: "", isActive: true }
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput name="name" label="Name" control={form.control} />
      <FormTextarea name="description" label="Description" control={form.control} />
      <FormSelect name="category" label="Category" control={form.control}>
        <SelectItem value="electronics">Electronics</SelectItem>
        <SelectItem value="clothing">Clothing</SelectItem>
      </FormSelect>
      <FormCheckbox name="isActive" label="Active" control={form.control} />
      <SubmitButton isSubmitting={form.formState.isSubmitting}>Save</SubmitButton>
    </form>
  )
}
```

### Available Form Components

| Component | Usage |
|-----------|-------|
| `FormInput` | Text, email, number, password inputs |
| `FormTextarea` | Multi-line text |
| `FormSelect` | Dropdown with `SelectItem` children |
| `FormCheckbox` | Boolean toggle |
| `SubmitButton` | Submit with `isSubmitting` loading state |

All components accept `name`, `label`, and `control` props. Pass `control={form.control}` from `useForm`.

## Organization Forms

When building organization-related forms (create org, invite member, update settings), follow the same form pattern above.

### Create Organization Form Example

```typescript
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormInput } from "@/components/form"
import { SubmitButton } from "@/components/ui/submit-button"
import { authClient } from "@/lib/auth-client"

const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
})

type FormData = z.infer<typeof createOrgSchema>

function CreateOrganizationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "", slug: "" }
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await authClient.organization.create({
      name: data.name,
      slug: data.slug,
    })
    if (error) {
      form.setError("root", { message: error.message })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput name="name" label="Organization Name" control={form.control} />
      <FormInput name="slug" label="Slug" control={form.control} />
      <SubmitButton isSubmitting={form.formState.isSubmitting}>Create Organization</SubmitButton>
    </form>
  )
}
```

### Invite Member Form Example

```typescript
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormInput, FormSelect } from "@/components/form"
import { SelectItem } from "@/components/ui/select"
import { SubmitButton } from "@/components/ui/submit-button"
import { authClient } from "@/lib/auth-client"

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.enum(["member", "admin"]),
})

type FormData = z.infer<typeof inviteSchema>

function InviteMemberForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member" }
  })

  const onSubmit = async (data: FormData) => {
    await authClient.organization.inviteMember({
      email: data.email,
      role: data.role,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput name="email" label="Email" control={form.control} />
      <FormSelect name="role" label="Role" control={form.control}>
        <SelectItem value="member">Member</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </FormSelect>
      <SubmitButton isSubmitting={form.formState.isSubmitting}>Send Invitation</SubmitButton>
    </form>
  )
}
```


