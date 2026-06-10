# Notifications Feature Implementation Plan

## Objective
Implement the shared Notifications feature based on the Figma design and API contract, accessible across Client, Expert, and Admin roles.

## API Contract Analysis
Found endpoints in `v1.json`:
- `GET /api/v1/notifications` (List notifications)
- `GET /api/v1/notifications/unread-count` (Get unread count)
- `PUT /api/v1/notifications/{id}/read` (Mark one as read)
- `PUT /api/v1/notifications/read-all` (Mark all as read)

**Missing API capabilities vs Figma UI:**
- The API schema for `GET /api/v1/notifications` only defines `PageSize`, `PageIndex`, and `SearchTerm` as query parameters. It does not define filters for `Type`, `Status`, `Priority`, or `Date range`. These filters will be implemented UI-side if possible, or disabled with a TODO comment.
- There is no endpoint to delete/clear notifications.

## Architecture & Structure
We will create a new shared feature module: `src/features/notifications/`.

### Files to Create:
1.  **Types**: `src/features/notifications/types.ts`
    *   Interfaces for `Notification`, paginated response, query params, and enums for NotificationType/Priority.
2.  **Services**: `src/features/notifications/services.ts`
    *   `notificationService` with methods mapping to the 4 endpoints above using `apiClient`.
3.  **Hooks**:
    *   `src/features/notifications/hooks/useNotifications.ts`: Fetch notifications with React Query.
    *   `src/features/notifications/hooks/useNotificationActions.ts`: Mutations for marking read.
4.  **Components** (`src/features/notifications/components/`):
    *   `NotificationList.tsx`: Renders the list.
    *   `NotificationItem.tsx`: Renders individual notification rows.
    *   `NotificationFilters.tsx`: Search bar and dropdowns (Filter dropdowns will have TODOs regarding backend support).
    *   `NotificationStats.tsx`: Renders the top metric cards (All, Unread, Action Required, etc.).
5.  **Pages**: `src/features/notifications/pages/NotificationsPage.tsx`
    *   The main container matching the Figma layout.
6.  **Index**: `src/features/notifications/index.ts` for clean exports.

### Existing Files to Modify:
1.  `src/shared/constants/index.ts`: Add `NOTIFICATIONS` endpoints to `API_ENDPOINTS`.
2.  `src/app/router.tsx`: Register `NotificationsPage` under `/client/notifications`, `/expert/notifications`, and `/admin/notifications`.
3.  `src/shared/components/dashboard/Topbar.tsx`: Connect the Bell icon to navigate to `/${user.role.toLowerCase()}/notifications`.

## Execution Steps
1.  Implement `types.ts` and `services.ts`.
2.  Implement React Query hooks.
3.  Build UI components (`NotificationItem`, `NotificationList`, `NotificationFilters`, `NotificationStats`) matching Figma styling.
4.  Assemble `NotificationsPage`.
5.  Wire up routes and Topbar navigation.
6.  Add TODO comments for UI-side filtering limitations.

## Verification
-   Ensure Bell icon routes correctly based on user role.
-   Ensure layout matches Figma.
-   Verify React Query hooks call correct endpoints.