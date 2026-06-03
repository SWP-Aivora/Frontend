# Auth Feature & Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Design System Foundations (Colors, Typography) and the Auth Feature (Login Page) with full store and API integration based on the Figma design.

**Architecture:** We use a Feature-Sliced Design (FSD) approach. Design tokens are injected into Tailwind v4. The Auth feature is self-contained with its own API, store, and UI components.

**Tech Stack:** React, TypeScript, Tailwind v4, Zustand, Axios, TanStack Query, React Hook Form, Zod, Lucide React.

---

### Task 1: Setup Testing Environment

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install testing dependencies**
Run: `cmd /c npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

- [ ] **Step 2: Create Vitest config**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: Create test setup file**
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Update package.json scripts**
Add `"test": "vitest"` to `scripts`.

- [ ] **Step 5: Verify setup**
Run: `cmd /c npm run test`
Expected: "No test files found" (Exit code 0 or 1 is fine as long as vitest runs).

- [ ] **Step 6: Commit**
```bash
git add package.json vitest.config.ts src/test/setup.ts
git commit -m "chore: setup testing environment with vitest and jsdom"
```

### Task 2: Design System Foundations (Theme Variables)

**Files:**
- Modify: `src/app/styles/index.css`
- Create: `src/shared/styles/tokens.css`

- [ ] **Step 1: Update index.css with Design Tokens**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "./tokens.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* System Mapping */
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-primary: #2563eb;
  --color-primary-foreground: #ffffff;
  --color-muted-foreground: #64748b;
  --color-border: #dcebff;

  /* Brand Tokens */
  --color-brand-blue-dark: #164c96;
  --color-brand-blue-light: #eff6ff;
  --color-brand-accent: #7c3aed;
  --color-brand-success: #10b981;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui;
  
  /* Radius */
  --radius-surface: 16px;
  --radius-card: 20px;
  --radius-panel: 28px;
}
```

- [ ] **Step 2: Create tokens.css for custom utilities**
```css
@layer utilities {
  .bg-gradient-hero {
    background: linear-gradient(to right, #ffffff, #eaf3ff);
  }
  .shadow-aivora {
    box-shadow: 0px 18px 40px -16px rgba(18, 49, 99, 0.1);
  }
  .shadow-aivora-large {
    box-shadow: 0px 24px 60px -8px rgba(27, 58, 122, 0.12);
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/styles/index.css src/shared/styles/tokens.css
git commit -m "feat: implement design system foundations and brand tokens"
```

### Task 3: Shared UI Components (Button & Input)

**Files:**
- Create: `src/shared/components/ui/Button.tsx`
- Create: `src/shared/components/ui/Input.tsx`
- Create: `src/shared/components/ui/index.ts`

- [ ] **Step 1: Write Button component with AIVORA variants**
```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-aivora hover:bg-primary/90",
        outline: "border border-border bg-background hover:bg-brand-blue-light text-brand-blue-dark",
        ghost: "hover:bg-brand-blue-light text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 2: Create Input component**
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Step 3: Create index.ts for UI components**
```tsx
export * from './Button';
export * from './Input';
```

- [ ] **Step 4: Commit**
```bash
git add src/shared/components/ui/
git commit -m "feat: add shared Button and Input components with custom styling"
```

### Task 4: Auth Feature (API & Schema)

**Files:**
- Create: `src/features/auth/api/authService.ts`
- Create: `src/features/auth/types/index.ts`
- Modify: `src/features/auth/store/authStore.ts`

- [ ] **Step 1: Define Auth Schemas and Types**
```tsx
import { z } from 'zod';
import { Role } from '@/shared/types/enums';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
  };
}
```

- [ ] **Step 2: Implement AuthService**
```tsx
import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import { LoginFormValues, AuthResponse } from '../types';
import { BaseResponse } from '@/shared/types/api';

export const authService = {
  login: async (data: LoginFormValues): Promise<BaseResponse<AuthResponse>> => {
    const response = await apiClient.post<BaseResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    // Optional: Call logout endpoint if exists
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
```

- [ ] **Step 3: Commit**
```bash
git add src/features/auth/api/ src/features/auth/types/
git commit -m "feat(auth): add login schema and auth service"
```

### Task 5: Auth Feature (Login UI)

**Files:**
- Create: `src/features/auth/components/LoginForm.tsx`
- Create: `src/shared/pages/LoginPage.tsx`
- Modify: `src/app/providers/RouterProvider.tsx`

- [ ] **Step 1: Create LoginForm component**
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { loginSchema, LoginFormValues } from '../types';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/authService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken);
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <Input 
          type="email" 
          placeholder="name@example.com" 
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Password</label>
        <Input 
          type="password" 
          placeholder="••••••••" 
          {...register('password')}
          className={errors.password ? 'border-destructive' : ''}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
```

- [ ] **Step 2: Create LoginPage with Split Layout**
```tsx
import { LoginForm } from '@/features/auth/components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-hero flex-col justify-center px-12 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-brand-blue-dark leading-tight mb-6">
            Find the Right AI Expert for Your Business
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            AIVORA connects clients with qualified AI experts to build next-generation solutions.
          </p>
        </div>
        {/* Background elements would go here as per Figma */}
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Update Router with real LoginPage**
```tsx
import { createBrowserRouter, RouterProvider as LibRouterProvider } from 'react-router-dom';
import { LoginPage } from '@/shared/pages/LoginPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home Page Placeholder</div>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export const RouterProvider = () => {
  return <LibRouterProvider router={router} />;
};
```

- [ ] **Step 4: Commit**
```bash
git add src/features/auth/components/LoginForm.tsx src/shared/pages/LoginPage.tsx src/app/providers/RouterProvider.tsx
git commit -m "feat(auth): implement login page UI and split layout"
```
