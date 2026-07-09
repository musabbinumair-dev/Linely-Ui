---
name: Linely dashboard architecture
description: How the Company Superadmin dashboard is structured and how new tab pages are wired in
---

`CompanySuperadminDashboard.tsx` is a single component with:
- `AdminSidebar` on the left (receives `activeTab` + `setActiveTab`)
- A sticky global top header (always visible, shared across all tabs)
- A scrollable body area that conditionally renders based on `activeTab`

**How to add a new page/tab:**
1. Create the page as a standalone component file (e.g. `MyPage.tsx`)
2. Import it in `CompanySuperadminDashboard.tsx`
3. Add `{ id: "my-tab", label: "My Tab", icon: SomeIcon }` to `menuItems` prop on AdminSidebar
4. Add `activeTab === "my-tab" ? <MyPage triggerToast={triggerToast} /> :` to the conditional rendering block (around line 606-615 after the header)
5. The page component should start with `<div className="flex-1 overflow-y-auto no-scrollbar"><div className="p-6 space-y-5 min-h-full">` to handle its own scroll and padding

**Why:** The scrollable body div (`overflow-y-auto p-6`) belongs to the overview tab only; new pages need their own scroll container and padding to fill the viewport correctly without double-scrollbars.

**Existing tabs:**
- overview, branches: use the default overview content in the scrollable div
- approvals → `PendingApprovalsPage`
- billing → `MRRInvoicesPage`
- alerts, settings: currently fall through to overview content (placeholder behavior)

**Shared toast:** `triggerToast(msg, type)` is defined in parent; always pass it as a prop — do not create a second toast system in child pages.
