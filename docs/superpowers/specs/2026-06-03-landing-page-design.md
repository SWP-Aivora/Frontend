# Design Document: AIVORA Landing Page

**Date:** 2026-06-03
**Status:** Draft

## 1. Overview
Implement the public-facing Landing Page for AIVORA, a marketplace connecting clients with AI experts. The design is based on Figma node `1:3` in file `fUL4M8KjswreWQHqJVh2Jg`.

## 2. Page Structure
The page consists of 10 primary sections:

1.  **Navbar**: Sticky header with brand logo, primary navigation (Home, Explore Experts, Post a Job, About), and auth actions (Sign In, Get Started).
2.  **Hero**: High-impact section featuring:
    *   An "AI expert marketplace" badge.
    *   Headline: "Find the Right AI Expert for Your Business".
    *   Search bar for experts/services.
    *   Tilted dashboard mockup illustrating platform capabilities.
3.  **Featured Categories**: Grid of 6 cards (Chatbot, RAG, NLP, Automation, Prompt Engineering, Integration).
4.  **Platform Highlights**: Visual demonstration of expert matching intelligence and core platform benefits.
5.  **How AIVORA Works**: 5-step process (Describe, Assistance, Find, Collaborate, Complete).
6.  **Featured Experts**: Showcase of 3 verified expert profile cards.
7.  **Featured AI Services**: 4 specific service package cards.
8.  **Trust & Updates**: Verification details and latest platform news.
9.  **CTA Band**: Final conversion section with a blue gradient background.
10. **Footer**: Logo, mission statement, and utility links.

## 3. Technical Implementation

### Components
- **Button**: Reusable `src/shared/components/ui/Button.tsx`.
- **Layout**: The page will be self-contained in `src/shared/pages/LandingPage.tsx` with internal sub-components for modularity.

### Styling
- **Tailwind v4**: Utilizing theme variables and custom utilities from `tokens.css`.
- **Colors**:
    - Primary: `--color-primary` (`#2563eb`)
    - Dark: `--color-brand-blue-dark` (`#0f172a`)
    - Text: `text-slate-600` / `text-slate-900`
- **Utilities**:
    - `bg-gradient-hero`: Hero section background.
    - `shadow-aivora`: Standard card shadows.

### Routing
- `src/app/router.tsx` will be updated to:
    - Map `/` to `LandingPage`.
    - Remove the default redirect to `/login`.

## 4. Approach
- **Phase 1: Foundation**: Update router and create the basic page shell.
- **Phase 2: Hero & Navbar**: Implement the top section with exact spacing and styles.
- **Phase 3: Core Sections**: Implement categories, highlights, and process sections.
- **Phase 4: Social Proof**: Implement expert profiles and service cards.
- **Phase 5: Final CTA & Footer**: Complete the bottom sections.
- **Phase 6: Validation**: Check responsiveness and link correctness.
