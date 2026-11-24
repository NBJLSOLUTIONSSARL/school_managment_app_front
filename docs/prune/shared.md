# SHARED Role — Page Contract Inventory

**Generated:** 2026-11-18
**Branch:** `chore/prune-to-contracts`
**Audit Source:** `src/app/router.jsx`, `src/components/layout/PrivateLayout.jsx`, `src/components/layout/PublicLayout.jsx`, `src/routes/*.jsx`, `src/features/**/*`

---

## 📋 Contract Definition (from PRUNE ORDER)

### SHARED — Public + All Authenticated
| Route | Block Name | Required? |
|-------|------------|-----------|
| `/login` | AuthCard (email/password, Google SSO, quick accounts, 2FA challenge) | ✅ |
| `/forgot-password` | ForgotForm (email submit, back to login link) | ✅ |
| `/reset-password` | ResetForm (token, new pwd, confirm, back to login) | ✅ |
| `/first-login` | ForcePwdForm (current, new, confirm, strength meter) | ✅ |
| `/two-factor` | TwoFactorCard (QR/secret, TOTP input, recovery codes, enable/disable) | ✅ |
| `/account` (tabs) | ProfileTabs: Overview | Security | Sessions | Documents | Notifications | Preferences | ✅ |
| `/my-documents` | DocumentTable (type, status, dates, View action) | ✅ |
| `/notifications` | NotificationCenter (filter by type/read, mark read, delete) | ✅ |
| `/messages` | MessageInbox (inbox/sent tabs, compose, read modal, delete) | ✅ |
| `/calendar` | CalendarView (month/week, event dots, click→detail) | ✅ |

---

## 📦 Inventory: Legacy Elements → Contract Blocks

| # | Legacy Element | File/Location | Contract Block | Decision | Notes |
|---|----------------|---------------|----------------|----------|-------|
| **PUBLIC AUTH ROUTES** |
| 1 | `/login` route | `src/app/router.jsx:69-71` | AuthCard | **KEEP** | Eager loaded `LoginPage` → `LoginForm` |
| 2 | LoginForm component | `src/features/auth/components/LoginForm.jsx` | AuthCard | **KEEP** | 547 lines, includes 2FA challenge, Google SSO, quick accounts |
| 3 | LoginPage route wrapper | `src/routes/LoginPage.jsx` | AuthCard | **KEEP** | Re-exports LoginForm |
| 4 | `/forgot-password` route | `src/app/router.jsx:73-75` | ForgotForm | **KEEP** | Eager loaded |
| 5 | ForgotPasswordPage | `src/routes/ForgotPasswordPage.jsx` | ForgotForm | **KEEP** | Wrapper for ForgotPasswordForm |
| 6 | ForgotPasswordForm | `src/features/auth/components/ForgotPasswordForm.jsx` | ForgotForm | **KEEP** | Email submit, back to login |
| 7 | `/reset-password` route | `src/app/router.jsx:77-79` | ResetForm | **KEEP** | Eager loaded |
| 8 | ResetPasswordPage | `src/routes/ResetPasswordPage.jsx` | ResetForm | **KEEP** | Wrapper for ResetPasswordForm |
| 9 | ResetPasswordForm | `src/features/auth/components/ResetPasswordForm.jsx` | ResetForm | **KEEP** | Token, new pwd, confirm, back to login |
| 10 | `/auth/google/callback` route | `src/app/router.jsx:81-83` | — | **KEEP** | OAuth callback, not in contract but required |
| 11 | GoogleCallbackPage | `src/routes/GoogleCallbackPage.jsx` | — | **KEEP** | Handles OAuth flow, account linking |
| 12 | `/force-password-change` route | `src/app/router.jsx:85-87` | ForcePwdForm | **KEEP** | Maps to `/first-login` contract |
| 13 | ForcePasswordChangePage | `src/routes/ForcePasswordChangePage.jsx` | ForcePwdForm | **KEEP** | Guards: authenticated + user.firstLogin |
| 14 | ForcePasswordChangeForm | `src/features/auth/components/ForcePasswordChangeForm.jsx` | ForcePwdForm | **KEEP** | Current/new/confirm, strength meter |
| **PUBLIC ERROR ROUTES** |
| 15 | `/403` route (PublicLayout) | `src/app/router.jsx:94-96` | — | **KEEP** | ForbiddenView, shows required roles |
| 16 | `/404` route (PublicLayout) | `src/app/router.jsx:98-100` | — | **KEEP** | NotFoundView, back to dashboard |
| 17 | ForbiddenView | `src/features/errors/components/ForbiddenView.jsx` | — | **KEEP** | Shows permissions details |
| 18 | NotFoundView | `src/features/errors/components/NotFoundView.jsx` | — | **KEEP** | 404 with back/dashboard actions |
| **PRIVATE SHARED ROUTES (all authenticated)** |
| 19 | `/dashboard` route | `src/app/router.jsx:113-119` | — | **KEEP** | DashboardPage → role-specific dashboard |
| 20 | DashboardPage | `src/routes/DashboardPage.jsx` | — | **KEEP** | Routes to role-specific dashboard view |
| 21 | `/profile` route | `src/app/router.jsx:261-266` | ProfileTabs | **KEEP** | ProfilePage → ProfileView |
| 22 | ProfilePage | `src/routes/ProfilePage.jsx` | ProfileTabs | **KEEP** | Wrapper for ProfileView |
| 23 | ProfileView | `src/features/profile/components/ProfileView.jsx` | ProfileTabs | **KEEP** | Personal info, 2FA, sessions, documents, AI consent |
| 24 | `/messages` route | `src/app/router.jsx:400-406` | MessageInbox | **KEEP** | MessageListPage → MessageInbox |
| 25 | MessageListPage | `src/routes/MessageListPage.jsx` | MessageInbox | **KEEP** | Wrapper for MessageInbox |
| 26 | MessageInbox | `src/features/messages/components/MessageInbox.jsx` | MessageInbox | **KEEP** | Inbox/sent tabs, compose, read, delete |
| 27 | MessageComposeModal | `src/features/messages/components/MessageComposeModal.jsx` | MessageInbox | **KEEP** | Modal for new/reply messages |
| 28 | MessageDetailsModal | `src/features/messages/components/MessageDetailsModal.jsx` | MessageInbox | **KEEP** | Modal for reading message |
| 29 | `/notifications` route | `src/app/router.jsx:408-413` | NotificationCenter | **KEEP** | NotificationListPage → NotificationList |
| 30 | NotificationListPage | `src/routes/NotificationListPage.jsx` | NotificationCenter | **KEEP** | Wrapper for NotificationList |
| 31 | NotificationList | `src/features/notifications/components/NotificationList.jsx` | NotificationCenter | **KEEP** | Filter by type/read, mark read, delete |
| 32 | `/events` route | `src/app/router.jsx:392-397` | CalendarView | **KEEP** | EventListPage → EventList (has calendar tab) |
| 33 | EventListPage | `src/routes/EventListPage.jsx` | CalendarView | **KEEP** | Wrapper for EventList |
| 34 | EventList | `src/features/events/components/EventList.jsx` | CalendarView | **KEEP** | List + Calendar tabs |
| 35 | EventCalendarView | `src/features/events/components/EventCalendarView.jsx` | CalendarView | **KEEP** | Month/week view, event dots |
| 36 | EventDetailsModal | `src/features/events/components/EventDetailsModal.jsx` | CalendarView | **KEEP** | Event detail modal |
| 37 | EventFormModal | `src/features/events/components/EventFormModal.jsx` | CalendarView | **KEEP** | Create/edit event modal |
| 38 | `/exams` route | `src/app/router.jsx:321-326` | — | **KEEP** | ExamListPage (no RoleGuard) |
| 39 | `/homework` route | `src/app/router.jsx:368-373` | — | **KEEP** | HomeworkPage (no RoleGuard) |
| 40 | `/report-cards` route | `src/app/router.jsx:376-381` | — | **KEEP** | ReportCardListPage (no RoleGuard) |
| 41 | `/announcements` route | `src/app/router.jsx:384-389` | — | **KEEP** | AnnouncementListPage (no RoleGuard) |
| 42 | `/leave-requests` route | `src/app/router.jsx:416-434` | — | **KEEP** | LeaveRequestListPage (RoleGuard for some roles) |
| 43 | `/showcase` route | `src/app/router.jsx:514-516` | — | **REMOVE** | Dev-only component showcase |
| 44 | ComponentShowcasePage | `src/routes/ComponentShowcasePage.jsx` | — | **REMOVE** | Dev-only |
| 45 | `/admin-only` route | `src/app/router.jsx:518-527` | — | **REMOVE** | Test route for 403 |
| **LAYOUT & NAVIGATION** |
| 46 | PrivateLayout | `src/components/layout/PrivateLayout.jsx` | — | **KEEP** | Sidebar, header, user menu, outlet |
| 47 | PublicLayout | `src/components/layout/PublicLayout.jsx` | — | **KEEP** | Wrapper for 403/404 |
| 48 | RoleGuard | `src/components/layout/RoleGuard.jsx` | — | **KEEP** | Protects routes by role/permission |
| 49 | Sidebar nav items | `PrivateLayout.jsx:71-354` | — | **KEEP** | 38 nav items grouped by section |
| 50 | Header: search bar | `PrivateLayout.jsx:652-665` | — | **KEEP** | Global search |
| 51 | Header: message icon | `PrivateLayout.jsx:671-678` | — | **KEEP** | Links to `/messages` |
| 52 | Header: notification dropdown | `PrivateLayout.jsx:681` | — | **KEEP** | NotificationDropdown component |
| 53 | Header: language switcher | `PrivateLayout.jsx:684` | — | **KEEP** | LanguageSwitcher component |
| 54 | Header: user menu | `PrivateLayout.jsx:687-741` | — | **KEEP** | Profile, Settings, Logout |
| 55 | NotificationDropdown | `src/features/notifications/components/NotificationDropdown.jsx` | — | **KEEP** | Real-time notification bell |
| 56 | ToastContainer | `PrivateLayout.jsx:767` | — | **KEEP** | Global toast notifications |
| 57 | ErrorBoundary | `PrivateLayout.jsx:751-761` | — | **KEEP** | Page-level error boundary |
| 58 | PageLoader | `PrivateLayout.jsx:448-450` | — | **KEEP** | Loading while auth initializes |
| **SHARED COMPONENTS (ui/)** |
| 59 | Button | `src/components/ui/Button.jsx` | — | **KEEP** | All variants, sizes |
| 60 | Card | `src/components/ui/card.jsx` | — | **KEEP** | Interactive, hover, header/content |
| 61 | Input | `src/components/ui/Input.jsx` | — | **KEEP** | With label, error, helper |
| 62 | Select | `src/components/ui/Select.jsx` | — | **KEEP** | Native select wrapper |
| 63 | Badge | `src/components/ui/badge.jsx` | — | **KEEP** | Semantic variants |
| 64 | Table | `src/components/ui/table.jsx` | — | **KEEP** | PaginatedTable, compact |
| 65 | Avatar | `src/components/ui/Avatar.jsx` | — | **KEEP** | With fallback |
| 66 | Modal | `src/components/ui/Modal.jsx` | — | **KEEP** | Portal, focus trap |
| 67 | Loader/Spinner | `src/components/ui/Loader.jsx` | — | **KEEP** | Spinner, skeleton |
| 68 | Toast | `src/components/ui/Toast.jsx` | — | **KEEP** | ToastContainer, semantic |
| 69 | Alert | `src/components/ui/Alert.jsx` | — | **KEEP** | Semantic variants |
| 70 | StatusBadge | `src/components/ui/StatusBadge.jsx` | — | **KEEP** | Status colors |
| 71 | DocTypePageHead | `src/components/ui/DocTypePageHead.jsx` | — | **KEEP** | Page header with actions |
| 72 | PaginatedTable | `src/components/ui/PaginatedTable.jsx` | — | **KEEP** | Table + pagination |
| 73 | EmptyState | `src/components/ui/EmptyState.jsx` | — | **KEEP** | Illustration + action |
| 74 | ConfirmDialog | `src/components/ui/ConfirmDialog.jsx` | — | **KEEP** | Danger/primary variants |
| 75 | LanguageSwitcher | `src/components/ui/LanguageSwitcher.jsx` | — | **KEEP** | Flag + label |
| 76 | EduTrackLogo | `src/components/ui/EduTrackLogo.jsx` | — | **KEEP** | SVG logo |
| 77 | ProfileIcon | `src/features/profile/components/ProfileIcon.jsx` | — | **KEEP** | Icon map for profile |
| **SHARED PROFILE SUB-COMPONENTS** |
| 78 | ProfileAvatar | `src/features/profile/components/ProfileAvatar.jsx` | ProfileTabs | **KEEP** | Editable avatar upload |
| 79 | TwoFactorSection | `src/features/profile/components/TwoFactorSection.jsx` | TwoFactorCard | **KEEP** | Enable/disable 2FA, QR, recovery codes |
| 80 | ActiveSessionsSection | `src/features/profile/components/ActiveSessionsSection.jsx` | ProfileTabs (Sessions) | **KEEP** | List sessions, revoke |
| 81 | LegalDocumentsSection | `src/features/profile/components/LegalDocumentsSection.jsx` | DocumentTable | **KEEP** | My-documents table |
| 82 | GoogleAccountLinkSection | `src/features/profile/components/GoogleAccountLinkSection.jsx` | ProfileTabs (Security) | **KEEP** | Link/unlink Google |
| **SHARED API SERVICES** |
| 83 | authApi | `src/features/auth/api/authApi.js` | AuthCard, ForgotForm, ResetForm, ForcePwdForm, TwoFactorCard | **KEEP** | login, forgot, reset, 2FA, Google |
| 84 | documentApi | `src/features/profile/api/documentApi.js` | DocumentTable | **KEEP** | getMyDocuments, getDocumentAccess |
| 85 | messageService | `src/features/messages/api/messageService.js` | MessageInbox | **KEEP** | getInbox, getSent, delete |
| 86 | notificationService | `src/features/notifications/api/notificationService.js` | NotificationCenter | **KEEP** | getUserNotifications, markRead, delete |
| 87 | statsService | `src/features/dashboard/api/statsService.js` | — | **KEEP** | Dashboard stats per role |
| **SHARED HOOKS** |
| 88 | useAuth | `src/hooks/useAuth.js` | All | **KEEP** | Auth context, user, roles, permissions |
| 89 | useI18n | `src/hooks/useI18n.js` | All | **KEEP** | Translation, language, dir |
| 90 | useToast | `src/hooks/useToast.js` | All | **KEEP** | Success/error toasts |
| **SHARED TRANSLATION KEYS (i18n)** |
| 91 | `login.*` | `src/locales/*.json` | AuthCard | **KEEP** | 30+ keys |
| 92 | `nav.*` | `src/locales/*.json` | All nav | **KEEP** | 40+ keys |
| 93 | `profile.*` | `src/locales/*.json` | ProfileTabs | **KEEP** | 25+ keys |
| 94 | `common.*` | `src/locales/*.json` | All | **KEEP** | 20+ keys |
| 95 | `errors.*` | `src/locales/*.json` | 403/404 | **KEEP** | 10+ keys |
| **SHARED TESTS** |
| 96 | LoginForm.test.jsx | `src/features/auth/__tests__/LoginForm.test.jsx` | AuthCard | **KEEP** | 15 tests |
| 97 | i18nLanguageFlow.test.jsx | `src/features/auth/__tests__/i18nLanguageFlow.test.jsx` | — | **KEEP** | Language on auth pages |
| 98 | PrivateLayout.test.jsx | `src/components/layout/__tests__/PrivateLayout.test.jsx` | — | **KEEP** | Sidebar, header, guards |
| 99 | MessageInbox tests | `src/features/messages/components/__tests__/` | MessageInbox | **KEEP** | Inbox, compose, read |
| 100 | NotificationList tests | `src/features/notifications/components/__tests__/` | NotificationCenter | **KEEP** | Filters, mark read, delete |
| 101 | EventList tests | `src/features/events/components/__tests__/` | CalendarView | **KEEP** | List/calendar toggle |
| 102 | ProfileView tests | `src/features/profile/components/__tests__/ProfileView.test.jsx` | ProfileTabs | **KEEP** | Profile, documents, 2FA |
| **MISSING FROM CONTRACT (need to build)** |
| 103 | `/first-login` route alias | — | ForcePwdForm | **BUILD** | Add redirect `/first-login` → `/force-password-change` |
| 104 | `/two-factor` route | — | TwoFactorCard | **BUILD** | Add route `/two-factor` → TwoFactorSection (standalone) |
| 105 | `/account` route with tabs | — | ProfileTabs | **BUILD** | ProfileView already has sections, needs tabbed layout |
| 106 | `/my-documents` route | — | DocumentTable | **BUILD** | LegalDocumentsSection exists, needs standalone route |
| 107 | `/calendar` route | — | CalendarView | **BUILD** | EventList has calendar tab, needs standalone `/calendar` route |
| **NOT IN CONTRACT (candidate for REMOVE)** |
| 108 | `/showcase` route + page | — | — | **REMOVE** | Dev-only |
| 109 | `/admin-only` route | — | — | **REMOVE** | Test-only |
| 110 | ComponentShowcaseView | `src/features/showcase/components/ComponentShowcaseView.jsx` | — | **REMOVE** | Dev-only |
| 111 | `/documents` nav item | `PrivateLayout.jsx:300-319` | — | **MOVE** | Nav item exists but NO route in router! |

---

## 🎯 Decision Summary

| Decision | Count |
|----------|-------|
| **KEEP** (matches contract or required infrastructure) | 97 |
| **BUILD** (contract requires, missing route) | 5 |
| **REMOVE** (dev-only, not in contract) | 4 |
| **MOVE** (nav item without route) | 1 |

---

## 🔧 Action Items

1. **Add route aliases** in `router.jsx`:
   - `/first-login` → redirect to `/force-password-change`
   - `/two-factor` → standalone TwoFactorSection page
   - `/my-documents` → standalone LegalDocumentsSection page
   - `/calendar` → standalone EventCalendarView page
   - `/account` → tabbed ProfileView (Overview|Security|Sessions|Documents|Notifications|Preferences)

2. **Remove dev routes** from `router.jsx`:
   - `/showcase` + ComponentShowcasePage
   - `/admin-only`

3. **Fix `/documents` nav item** in PrivateLayout: either add route or remove nav item

4. **Add `data-contract` markers** to each block root component:
   - LoginForm: `data-contract="auth-card"`
   - ForgotPasswordForm: `data-contract="forgot-form"`
   - ResetPasswordForm: `data-contract="reset-form"`
   - ForcePasswordChangeForm: `data-contract="force-pwd-form"`
   - TwoFactorSection: `data-contract="two-factor-card"`
   - ProfileView: `data-contract="profile-tabs"`
   - LegalDocumentsSection: `data-contract="document-table"`
   - MessageInbox: `data-contract="message-inbox"`
   - NotificationList: `data-contract="notification-center"`
   - EventList/EventCalendarView: `data-contract="calendar-view"`

5. **Contract tests**: Create `src/__tests__/contract/shared.contract.test.jsx` comparing rendered `data-contract` keys with contract list