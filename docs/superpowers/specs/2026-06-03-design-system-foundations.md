# Design System Foundations: AIVORA

**Date:** 2026-06-03
**Status:** Draft
**Topic:** Design System Foundations (Colors, Typography, UI Components)

## 1. Overview
This specification defines the foundational design tokens and shared UI components for the AIVORA platform, based on the Figma design provided. The goal is to establish a robust, reusable base that ensures visual consistency across all features (Landing Page, Login, Admin Dashboard).

## 2. Design Tokens

### 2.1 Colors (Tailwind v4 / OKLCH)
We will use a combined approach mapping Figma hex values to Shadcn system variables and custom brand tokens.

| System Variable | Hex Value | Usage |
| :--- | :--- | :--- |
| `--background` | `#FFFFFF` | Main page background |
| `--foreground` | `#0F172A` | Primary text (Slate-900) |
| `--primary` | `#2563EB` | Buttons, active states, links |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--muted-foreground` | `#64748B` | Secondary text, placeholders |
| `--border` | `#DCEBFF` | Panel borders, dividers |

| Brand Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--brand-blue-dark` | `#164C96` | Logo, main headings |
| `--brand-blue-light`| `#EFF6FF` | Hero badges, light backgrounds |
| `--brand-accent` | `#7C3AED` | Special category cards (Expert) |
| `--brand-success` | `#10B981` | Status indicators (Available) |

### 2.2 Typography
- **Font Family:** `Inter`, sans-serif.
- **Font Weights:** Regular (400), Medium (500), SemiBold (600), Bold (700).
- **Heading Styles:**
  - `h1`: 56px/64px (Bold)
  - `h2`: 44px/54px (Bold)
  - `h3`: 34px/42px (Bold)

### 2.3 Radius & Shadows
- **Radius:** 16px (Surface), 20px (Cards), 28px (Large Panels).
- **Shadows:** Custom soft shadows with blue tint for AIVORA branding.

## 3. Shared Components
- **Button:** Custom variants for "Primary Blue", "Ghost Blue", and "Dark Outline".
- **Input:** Search input with integrated icon support and focus states.
- **Badge:** Rounded pill-style badges for categories and statuses.

## 4. Implementation Strategy
1. **CSS Variables:** Inject tokens into `@theme` block in `src/app/styles/index.css`.
2. **Global Utilities:** Define `bg-gradient-hero`, `shadow-aivora` in a separate shared style file.
3. **Component Scaffolding:** Initialize basic Shadcn components and apply AIVORA-specific styling overrides.

## 5. Testing & Validation
- **Visual Check:** Verify token resolution against Figma values using the Visual Companion.
- **Accessibility:** Ensure color contrast ratios meet WCAG standards for primary actions.
