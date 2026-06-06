# Fix Functional Bugs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three critical functional bugs related to form state (`ResolutionForm`), mock file uploads (`useUpload`), and hardcoded escrow amounts (`DisputeDetailPage`) without altering the UI.

**Architecture:** We will surgically update specific React components and hooks to wire up proper state management and real API responses.

**Tech Stack:** React, react-hook-form, TailwindCSS, TypeScript.

---

### Task 1: Fix ResolutionForm `onChange` conflict

**Files:**
- Modify: `src/features/disputes/components/ResolutionForm.tsx`

- [ ] **Step 1: Update `onChange` handler**

In the `ResolutionForm` component, modify the `<select>` element to correctly merge `react-hook-form`'s `onChange` and the custom logic. Use `setValue` to force validation.

```tsx
          <select
            {...register('resolutionType', { valueAsNumber: true })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => {
              const val = parseInt(e.target.value);
              // Call react-hook-form's setValue so the form state updates properly
              setValue('resolutionType', val, { shouldValidate: true });
              
              if (totalAmount !== undefined) {
                if (val === DisputeResolutionType.RELEASE_TO_EXPERT) {
                  setValue('releaseAmount', totalAmount);
                  setValue('refundAmount', 0);
                } else if (val === DisputeResolutionType.REFUND_TO_CLIENT) {
                  setValue('releaseAmount', 0);
                  setValue('refundAmount', totalAmount);
                }
              }
            }}
          >
```

- [ ] **Step 2: Hide `SPLIT_PAYMENT` if `totalAmount` is unavailable (Preparation for Task 3)**

Update `ResolutionFormProps` to make `totalAmount` optional. Update the options to conditionally show the split payment option.

```tsx
interface ResolutionFormProps {
  disputeId: string;
  totalAmount?: number;
}
```

```tsx
            <option value={DisputeResolutionType.RELEASE_TO_EXPERT}>Thanh toán toàn bộ cho Expert</option>
            <option value={DisputeResolutionType.REFUND_TO_CLIENT}>Hoàn tiền toàn bộ cho Client</option>
            {totalAmount !== undefined && (
              <option value={DisputeResolutionType.SPLIT_PAYMENT}>Chia sẻ thanh toán (Tùy chỉnh)</option>
            )}
            <option value={DisputeResolutionType.EXPERT_WORK_REDO}>Yêu cầu Expert làm lại</option>
```

### Task 2: Implement Real Upload Logic

**Files:**
- Modify: `src/shared/hooks/useUpload.ts`

- [ ] **Step 1: Replace mock with `mediaService`**

Import `mediaService` and replace the `setTimeout` mock with a real API call.

```tsx
import { useState } from 'react';
import { mediaService } from '../services/mediaService';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, folder?: string) => {
    setIsUploading(true);
    try {
      const response = await mediaService.uploadFile(file, folder);
      return { url: response.data.url };
    } catch (error) {
      console.error('Upload failed', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
  };
};
```

### Task 3: Dynamically Bind Escrow Amount

**Files:**
- Modify: `src/features/disputes/types.ts`
- Modify: `src/features/disputes/pages/DisputeDetailPage.tsx`

- [ ] **Step 1: Add `milestoneAmount` to `Dispute` interface**

```tsx
export interface Dispute {
  id: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneAmount?: number;
  // ... rest of fields
```

- [ ] **Step 2: Update DisputeDetailPage to use dynamic amount**

Conditionally render the Payment Warning Block and tags. If `dispute.milestoneAmount` is available, show it; otherwise hide the section.

Replace:
```tsx
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100 mr-2">
              <Lock className="size-4 text-red-600" />
              <span className="text-xs font-bold text-red-700">Disputed: $200 Frozen</span>
            </div>
```
With:
```tsx
            {dispute.milestoneAmount !== undefined && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100 mr-2">
                <Lock className="size-4 text-red-600" />
                <span className="text-xs font-bold text-red-700">Disputed: ${dispute.milestoneAmount} Frozen</span>
              </div>
            )}
```

Replace:
```tsx
          {/* Payment Warning Block */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex items-start gap-4">
            <div className="size-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="size-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 mb-1">Payment Frozen in Escrow</h3>
              <p className="text-red-700/80 text-xs leading-relaxed">
                The milestone payment of <span className="font-bold">$200.00</span> is currently locked. Funds will not be released until a final resolution is reached.
              </p>
            </div>
          </div>
```
With:
```tsx
          {/* Payment Warning Block */}
          {dispute.milestoneAmount !== undefined && (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex items-start gap-4">
              <div className="size-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900 mb-1">Payment Frozen in Escrow</h3>
                <p className="text-red-700/80 text-xs leading-relaxed">
                  The milestone payment of <span className="font-bold">${dispute.milestoneAmount.toFixed(2)}</span> is currently locked. Funds will not be released until a final resolution is reached.
                </p>
              </div>
            </div>
          )}
```

- [ ] **Step 3: Update `ResolutionForm` prop**

```tsx
          {/* Admin Decision Form (If not resolved and user is admin) */}
          {isAdmin && !isResolved && (
            <div className="animate-in slide-in-from-right-4 duration-700">
              <ResolutionForm 
                disputeId={dispute.id} 
                totalAmount={dispute.milestoneAmount} 
              />
            </div>
          )}
```
