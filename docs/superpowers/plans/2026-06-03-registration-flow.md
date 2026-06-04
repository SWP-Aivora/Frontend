# 2-Step Registration Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a 2-step registration flow in `RegisterPage.tsx` and `RegisterForm.tsx` with role selection in Step 1 and information form in Step 2.

**Architecture:** Use local state in `RegisterPage` to manage `step` ('selection' | 'details') and `selectedRole`. Pass these to `RegisterForm` which handles the actual form fields and submission.

**Tech Stack:** React, Tailwind v4, React Hook Form, Zod.

---

### Task 1: Update RegisterPage Step 1 UI

**Files:**
- Modify: `src/features/auth/pages/RegisterPage.tsx`

- [ ] **Step 1: Add state for step and role**
```tsx
import { useState } from 'react';
import { Role } from '@/shared/types/enums';

// Inside RegisterPage component
const [step, setStep] = useState<'selection' | 'details'>('selection');
const [selectedRole, setSelectedRole] = useState<Role>(Role.CLIENT);

const handleRoleSelect = (role: Role) => {
  setSelectedRole(role);
  setStep('details');
};
```

- [ ] **Step 2: Implement Step 1 UI (Role Selection)**
Replace the right panel content with role selection cards when `step === 'selection'`.
```tsx
{step === 'selection' ? (
  <div className="space-y-8 animate-in fade-in zoom-in duration-500">
    <div className="space-y-4 text-center lg:text-left">
      <p className="text-xs font-bold text-primary tracking-widest uppercase">Step 1 of 2 — Role Selection</p>
      <h2 className="text-4xl font-black text-foreground tracking-tight">Choose Your Account Type</h2>
      <p className="text-muted-foreground leading-relaxed font-medium">
        Select how you want to use AIVORA. You can change this later in your profile settings.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        { 
          role: Role.CLIENT, 
          title: 'I am a Client', 
          desc: 'I want to hire AI experts for my projects',
          icon: 'CL',
          color: 'primary'
        },
        { 
          role: Role.EXPERT, 
          title: 'I am an AI Expert', 
          desc: 'I want to offer my AI services and apply for jobs',
          icon: 'EX',
          color: 'brand-accent'
        }
      ].map((item) => (
        <div 
          key={item.role}
          onClick={() => handleRoleSelect(item.role)}
          className="group cursor-pointer p-8 rounded-[32px] border-2 border-slate-100 bg-white hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col items-center text-center space-y-4"
        >
          <div className={`size-16 rounded-full bg-${item.color}/10 flex items-center justify-center text-2xl font-black text-${item.color} group-hover:scale-110 transition-transform duration-500`}>
            {item.icon}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </div>
          <div className="pt-2">
             <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Select Role & Continue →</span>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  // Step 2 Content (RegisterForm)
)}
```

- [ ] **Step 3: Add Back button and Breadcrumb in Step 2**
When in Step 2, show a "Back" button to return to Step 1.
```tsx
{step === 'details' && (
  <div className="space-y-8 animate-in fade-in zoom-in duration-500">
     <button 
       onClick={() => setStep('selection')}
       className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
     >
       <svg className="size-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
       </svg>
       Back to Role Selection
     </button>
     
     <div className="space-y-4">
        <p className="text-xs font-bold text-primary tracking-widest uppercase">Step 2 of 2 — Account Details</p>
        <h2 className="text-4xl font-black text-foreground tracking-tight">Complete Your Profile</h2>
        <p className="text-muted-foreground leading-relaxed font-medium">
          You're registering as an <span className="text-primary font-bold">{selectedRole}</span>. Fill in your details below to get started.
        </p>
     </div>
     
     <RegisterForm selectedRole={selectedRole} />
  </div>
)}
```

- [ ] **Step 4: Commit**
```bash
git add src/features/auth/pages/RegisterPage.tsx
git commit -m "feat(auth): implement step 1 role selection in RegisterPage"
```

### Task 2: Update RegisterForm to handle Step 2

**Files:**
- Modify: `src/features/auth/components/RegisterForm.tsx`

- [ ] **Step 1: Update Props and Interface**
```tsx
interface RegisterFormProps {
  selectedRole: Role;
}

export const RegisterForm = ({ selectedRole }: RegisterFormProps) => {
  // ...
}
```

- [ ] **Step 2: Sync Role with Form State**
Use `useEffect` to update the form's `role` field when `selectedRole` changes.
```tsx
useEffect(() => {
  setValue('role', selectedRole);
}, [selectedRole, setValue]);
```

- [ ] **Step 3: Remove Role Selection UI from Form**
Delete the "I want to join as a:" section and the role cards from `RegisterForm.tsx`.

- [ ] **Step 4: Refine Layout for single step**
Ensure the "Create Account" button and other fields are properly spaced.

- [ ] **Step 5: Commit**
```bash
git add src/features/auth/components/RegisterForm.tsx
git commit -m "feat(auth): update RegisterForm to receive role from parent and remove selection UI"
```

### Task 3: Verification & Polish

**Files:**
- Modify: `src/features/auth/pages/RegisterPage.tsx`
- Modify: `src/features/auth/components/RegisterForm.tsx`

- [ ] **Step 1: Verify transitions**
Ensure `animate-in fade-in zoom-in duration-500` is applied and looks smooth.

- [ ] **Step 2: Verify validation**
Try submitting without fields to ensure Step 2 validation still works.

- [ ] **Step 3: Run existing tests**
Run: `npm run test`
Expected: All tests pass (or at least don't regress due to these changes).

- [ ] **Step 4: Commit**
```bash
git add src/features/auth/pages/RegisterPage.tsx src/features/auth/components/RegisterForm.tsx
git commit -m "feat(auth): final polish for 2-step registration flow"
```
