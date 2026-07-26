# Important Lessons for Working With This Codebase

## Check Syntax Before Committing

### Always Do These

1. Run `npm run lint` before committing to catch syntax and lint issues.
2. Run `npm run build` to make sure the production build succeeds.
3. Check JSX syntax carefully:
   - Every JSX tag must have the correct opening and closing tag.
   - Self-closing tags must include `/>`.
   - Avoid stray characters and encoding issues.

### Common Mistakes

- Missing `<` at the beginning of a tag: write `<Button`, not `Button`.
- Unmatched tags: the number of opening and closing tags must match.
- Incorrect self-closing tags: use `<input />`, not `<input>`.
- Invalid JSX comments: use `{/* comment */}`, not `// comment`.

## Check the Environment

### Always Test On

- Local environment
- Real build command: `npm run build`
- CI/CD environment, when available

### Important Commands

```bash
# Check syntax and lint rules
npm run lint

# Build the whole project
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

## Pre-Commit Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] JSX tags in changed files are valid
- [ ] Opening and closing tags match
- [ ] Changed functionality was tested locally

## Production Toast Smoke Check

Use this after deploying when a change depends on visible toast feedback:

1. Open the deployed `/register` page.
2. Submit the form with an email that already exists.
3. Confirm the request returns a 400 duplicate-email response.
4. In the browser console, confirm a real Sonner toast exists:
   ```js
   document.querySelector('[data-sonner-toast]')
   ```
5. Confirm the duplicate-email error text is visible to the user.

Do not rely only on `[data-sonner-toaster]`; current Sonner builds expose individual toast items as `[data-sonner-toast]`, and the toaster container selector may not exist.

## Cases That Need Extra Care

1. When editing JSX, inspect each tag carefully, especially nested tags.
2. When deleting code, make sure no closing tags or comments are left broken.
3. When copying and pasting, re-check the full syntax, not only the logic.

## Helpful Tools

- VS Code extensions: ESLint, Prettier
- Terminal commands: npm scripts and `rg` for searching
- Build pipeline: CI/CD catches problems early

## Real-World Lesson

### Case Study: JSX Syntax Error in `ProjectWorkspacePage.tsx`

Problem: `Parsing error: Unexpected token. Did you mean {'>'} or &gt;?`

Cause: a `<Button>` tag was missing the opening `<`.

Fix: add the missing `<` in the correct place.

Impact: the issue failed CI/CD and required another commit.

Lesson:

- Better safe than sorry: inspect carefully before pushing.
- Always verify syntax in both local and production-like environments.

---

Remember: check twice, commit once.
