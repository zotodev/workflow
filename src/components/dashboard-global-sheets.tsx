import { LocationSelectionDialog } from "@/app/dashboard/-components/location-selection-dialog"
import { CalendarSetupSheet } from "@/app/dashboard/-components/calendar-setup-sheet"
import { InvitationsSheet } from "@/app/dashboard/-components/invitations-sheet"
import { OrganizationOnboardingDialog } from "@/app/dashboard/-components/org-onboarding-dialog"
import { Route } from "@/app/dashboard/layout"
import { OrgDetailSheet } from "@/app/dashboard/super-admin/-components/org-detail-sheet"
import { InviteUserSheet } from "@/app/dashboard/super-admin/users/-components/invite-user-sheet"
import { UserDetailSheet } from "@/app/dashboard/super-admin/users/-components/user-detail-sheet"

export function DashboardGlobalSheets() {
  const { setCalendar } = Route.useSearch()

  return (
    <div>
      <CalendarSetupSheet open={setCalendar === true} />
      <LocationSelectionDialog />
      <OrganizationOnboardingDialog />
      <InvitationsSheet />
      <OrgDetailSheet />
      <InviteUserSheet />
      <UserDetailSheet />
    </div>
  )
}
