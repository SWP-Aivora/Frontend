# Design Spec: 2-Step Registration Flow

**Date:** 2026-06-03
**Status:** Approved (Headless)
**Topic:** Multi-step Registration UI

## 1. Overview
Implement a premium, 2-step registration process to improve user experience and clarity during the onboarding of AIVORA.

## 2. User Experience (Step-by-Step)

### Step 1: Role Selection
- **Goal:** User identifies as either a "Client" or an "AI Expert".
- **UI:** Two large, interactive cards.
- **Action:** Clicking a card sets the role and transitions to Step 2.
- **styling:** Blur glows, white cards with blue borders, consistent with the new login page.

### Step 2: Information Form
- **Goal:** Collect user details (Name, Email, Password).
- **UI:** Standard registration form fields.
- **Context:** Displays "Registering as [Role]" to maintain context.
- **Action:** "Create Account" submits the form.

## 3. Technical Implementation

### 3.1 Components
- **RegisterPage.tsx:**
  - State: `step` ('selection' | 'details'), `selectedRole` (Role | null).
  - Logic: Handles step transitions and layout consistency.
- **RegisterForm.tsx:**
  - Props: `selectedRole: Role`, `onBack: () => void`.
  - Logic: uses `react-hook-form` with `zodResolver`. Sets the `role` field programmatically.

### 3.2 Styling & Animation
- **Tailwind v4:** Use `animate-in fade-in zoom-in duration-500` for step transitions.
- **Cards:** `bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-2xl hover:border-primary/50 transition-all`.
- **Blur Glows:** Reuse `ASSETS` from `RegisterPage.tsx`.

### 3.3 Validation
- **Schema:** Use existing `registerSchema` from `src/features/auth/schema.ts`.
- **Initial Values:** `role` is pre-filled from the selection step.

## 4. Design Self-Review
1. **Placeholder scan:** None.
2. **Internal consistency:** Roles match `Role` enum. Schema matches form fields.
3. **Scope check:** Focused on `RegisterPage` and `RegisterForm`.
4. **Ambiguity check:** "Back" button behavior is clearly defined (returns to Step 1).
