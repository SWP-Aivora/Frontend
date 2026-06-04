# AIVORA Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a pixel-perfect, responsive Landing Page for AIVORA based on Figma designs.

**Architecture:** A single high-performance page component `LandingPage.tsx` composed of functional sub-components. Uses Tailwind v4 for styling and shared UI components for consistency.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React (for icons), Framer Motion (optional, for subtle animations).

---

### Task 1: Router and Shell

**Files:**
- Modify: `src/app/router.tsx`
- Create: `src/shared/pages/LandingPage.tsx`
- Modify: `src/shared/pages/index.ts`

- [ ] **Step 1: Create the LandingPage component shell**
Create `src/shared/pages/LandingPage.tsx` with a basic "Under Construction" message.

```tsx
import React from 'react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-4xl font-bold text-center mt-20">AIVORA Landing Page</h1>
    </div>
  );
};
```

- [ ] **Step 2: Export LandingPage**
Update `src/shared/pages/index.ts`.

```tsx
export * from './LandingPage';
// ... existing exports
```

- [ ] **Step 3: Update Router**
Modify `src/app/router.tsx` to set `LandingPage` as the root element.

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LandingPage } from '../shared/pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  // ... other routes
]);
```

- [ ] **Step 4: Commit**
`git add src/shared/pages/LandingPage.tsx src/shared/pages/index.ts src/app/router.tsx && git commit -m "feat(landing): setup page shell and router"`

---

### Task 2: Navbar Implementation

**Files:**
- Modify: `src/shared/pages/LandingPage.tsx`

- [ ] **Step 1: Implement Navbar component**
Add the `Navbar` sub-component to `LandingPage.tsx`.

```tsx
const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold text-brand-blue-dark">AIVORA</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-900">Home</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary">Explore Experts</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary">Post a Job</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary">About</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild><a href="/login">Sign in</a></Button>
          <Button size="sm" asChild><a href="/register">Get Started</a></Button>
        </div>
      </div>
    </nav>
  );
};
```

- [ ] **Step 2: Commit**
`git commit -am "feat(landing): implement navbar"`

---

### Task 3: Hero Section Implementation

**Files:**
- Modify: `src/shared/pages/LandingPage.tsx`

- [ ] **Step 1: Implement Hero section**
Add the `Hero` sub-component with the gradient background, headline, and mockup.

```tsx
const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero -z-10" />
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold mb-6">
            AI expert marketplace
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Find the Right <br />
            AI Expert for <br />
            Your Business
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl">
            AIVORA connects clients with qualified AI experts to build chatbots, RAG systems, automation workflows, NLP solutions, and custom AI-powered projects.
          </p>
          {/* Search Bar & CTAs */}
        </div>
        <div className="relative">
          {/* Dashboard Mockup Image/Visuals */}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Commit**
`git commit -am "feat(landing): implement hero section"`

---

### Task 4: Content Sections (Categories & How it Works)

**Files:**
- Modify: `src/shared/pages/LandingPage.tsx`

- [ ] **Step 1: Implement Category Cards**
Create a grid of categories as shown in the design.

- [ ] **Step 2: Implement "How it Works"**
Create the numbered step cards.

- [ ] **Step 3: Commit**
`git commit -am "feat(landing): add categories and process sections"`

---

### Task 5: Trust & Conversion (Experts, Services, CTA Band, Footer)

**Files:**
- Modify: `src/shared/pages/LandingPage.tsx`

- [ ] **Step 1: Implement Expert Profile Cards**
- [ ] **Step 2: Implement Service Package Cards**
- [ ] **Step 3: Implement Footer CTA and Footer**
- [ ] **Step 4: Commit**
`git commit -am "feat(landing): complete all sections and footer"`
