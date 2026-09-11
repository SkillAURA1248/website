# Implementation Plan

- [x] 1. Fix `AuthPage.tsx`: replace `window.location.href` with `navigate()`
  - In `src/pages/AuthPage.tsx`, inside `handleSubmit`, replace both hard-reload redirects with
    React Router client-side navigation
  - Sign-up success: `window.location.href = '/onboarding'` → `navigate('/onboarding')`
  - Sign-in success: `window.location.href = from` → `navigate(from)`
  - `useNavigate` is already imported and `navigate` is already declared — no new imports needed
  - **Root cause fixed**: hard browser reload no longer destroys React Router state; `RequireAuth`
    sees `isSignedIn = true` immediately and renders the protected page without a reload
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1_

- [x] 2. Fix `auth.tsx`: add defensive `setIsLoading(false)` to `catch` block
  - In `src/lib/auth.tsx`, inside `AuthProvider` → `load()`, add `setIsLoading(false)` to the
    `catch` block
  - The existing `finally` block already calls `setIsLoading(false)`, so behavior is unchanged
    at runtime — this is a belt-and-suspenders safety net that makes the `catch` block
    self-contained and resilient to future refactors
  - Ensures `RequireAuth` always exits the loading spinner phase and reaches the redirect logic,
    regardless of how `load()` is restructured in the future
  - _Requirements: 2.4_

- [x] 3. Create `public/_redirects` for production SPA fallback
  - Create `public/_redirects` with content: `/* /index.html 200`
  - Vite copies the entire `public/` directory into `dist/` during build, so the file is
    automatically included in the production bundle
  - Netlify reads `_redirects` automatically; all requests to unmatched paths (e.g. `/discover`)
    are served `index.html` with HTTP 200, allowing React Router to handle routing
  - For Vercel: create `vercel.json` at the project root with
    `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
  - No changes to `vite.config.ts` — Vite's dev server already handles SPA routing via its
    built-in `historyApiFallback`
  - **Root cause fixed**: static host no longer returns HTTP 404 before React loads; unauthenticated
    users navigating directly to `/discover` are redirected to `/auth` by `RequireAuth`
  - _Requirements: 2.5, 2.6_

- [x] 4. Verify all fixes (manual smoke test)
  - Start the dev server (`npm run dev`) and verify:
    1. Sign in with valid credentials → lands on `/discover` without a full page reload ✓
    2. Sign up → lands on `/onboarding` without a full page reload ✓
    3. Open a new tab and navigate directly to `/discover` without being logged in →
       redirected to `/auth` with the loading spinner briefly showing, then `/auth` renders ✓
    4. Sign in from `/auth` with `state.from = '/discover'` → lands on `/discover` ✓
    5. Navigate to a genuinely non-existent route (e.g. `/gibberish`) → `NotFoundPage` renders ✓
    6. Build the app (`npm run build`) and confirm `dist/_redirects` is present ✓
