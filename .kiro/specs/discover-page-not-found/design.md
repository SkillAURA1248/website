# Discover Page Not Found — Bugfix Design

## Overview

Two related bugs cause the SkillSwap app to display `NotFoundPage` (or an infinite loading
spinner) instead of the intended protected page.

**Bug 1 — Post-login hard reload (`AuthPage.tsx`):** After a successful sign-in or sign-up,
`handleSubmit` navigates using `window.location.href`. This destroys the running React
application. The freshly-mounted `AuthProvider` starts in `isLoading = true`, and `RequireAuth`
cannot immediately confirm authentication. Depending on timing, the user either sees a blank
spinner, gets bounced back to `/auth`, or falls through to `NotFoundPage` via the wildcard `*`
route.

**Bug 2 — Production static server returns HTTP 404 for SPA routes (`_redirects` / deployment
config):** When the built app is deployed to a static host (Netlify, Vercel, GitHub Pages, etc.)
with no SPA fallback rule, the server serves a real HTTP 404 for any path that isn't a physical
file. The React app never loads, so React Router never runs, and the user sees the server-level
"not found" page — not `NotFoundPage`. In development, Vite's built-in SPA fallback masks this
entirely.

**Defensive addition — `catch` block safety in `auth.tsx`:** The `catch` block in
`AuthProvider.load()` does not call `setIsLoading(false)`. While the existing `finally` block
already handles this (so the gap cannot manifest at runtime today), adding an explicit call to
the `catch` block makes the invariant resilient to future refactors that might restructure the
try/catch/finally (e.g. replacing `finally` with per-branch calls).

The minimal fix is:
1. **2 line changes** in `src/pages/AuthPage.tsx` — replace both `window.location.href`
   assignments with `navigate()`.
2. **1 line addition** in `src/lib/auth.tsx` — add `setIsLoading(false)` to the `catch` block as
   a defensive safety net.
3. **New deployment config file** — add `public/_redirects` (Netlify) or `vercel.json` (Vercel)
   to ensure the static server always serves `index.html` for unmatched paths.

## Glossary

- **Bug_Condition (C)**: The condition under which a bug manifests — see each bug's formal
  specification below.
- **Property (P)**: The desired correct behavior for inputs matching the bug condition.
- **Preservation**: Existing behaviors that must remain identical after the fix.
- **handleSubmit**: The async form-submit handler in `src/pages/AuthPage.tsx` that calls
  `signIn` or `signUp` and performs the post-auth redirect.
- **RequireAuth**: The guard component in `src/App.tsx` that redirects unauthenticated users to
  `/auth`, passing the originally-requested pathname in `location.state.from`.
- **from**: The pathname string stored in router location state by `RequireAuth`; used by
  `AuthPage` to redirect back to the originally-requested page after login.
- **isLoading**: The `AuthContext` flag that is `true` while the user profile is being fetched;
  `RequireAuth` renders a spinner (not the protected route) while this is `true`.
- **SPA fallback**: A static-host configuration rule that instructs the server to serve
  `index.html` for all request paths that don't match a physical file, allowing React Router to
  handle client-side routing.
- **load()**: The async function inside `AuthProvider` that reads `localStorage` and optionally
  fetches the user profile from Supabase; responsible for setting `isLoading` to `false` when
  done.

## Bug Details

### Bug 1 — Post-login Hard Reload

#### Bug Condition

The bug manifests when a user successfully completes sign-in or sign-up in `AuthPage.tsx`.
The `handleSubmit` function uses `window.location.href` instead of React Router's `navigate()`.

**Formal Specification:**

```
FUNCTION isBugCondition_1(input)
  INPUT: input — the outcome of a sign-in or sign-up form submission
  OUTPUT: boolean

  RETURN input.authSuccess = true
         AND input.redirectMechanism = HARD_RELOAD   -- window.location.href used
         AND input.targetPath IN [from, '/onboarding']
END FUNCTION
```

#### Examples

- **Sign-in → /discover**: User submits valid credentials. `signIn` returns a profile.
  `window.location.href = '/discover'` fires. Full page reload. `AuthContext` re-mounts with
  `isLoading = true`. `RequireAuth` renders spinner. Race condition: either lands on
  `NotFoundPage` (wildcard `*` route) or is bounced back to `/auth`.
  **Expected**: Client-side `navigate('/discover')` — no reload, `RequireAuth` sees
  `isSignedIn = true` immediately.

- **Sign-in with custom `from`**: User was on `/messages`, session expired, redirected to
  `/auth`. After re-login, `window.location.href = '/messages'` reloads. Same race condition.
  **Expected**: `navigate('/messages')` — returns user to original page in-process.

- **Sign-up → /onboarding**: New user registers. `window.location.href = '/onboarding'` fires.
  Page reloads. Onboarding may not render if auth state hasn't resolved.
  **Expected**: `navigate('/onboarding')` — in-process navigation.

- **Edge case — `from` resolves to `/auth`**: If `from` somehow stores `/auth`, the fix calls
  `navigate('/auth')`. No infinite-loop guard is needed at this layer — `RequireAuth` is
  not on the `/auth` route.

---

### Bug 2 — Production Static Server Returns HTTP 404 for SPA Routes

#### Bug Condition

The bug manifests when the built app is served from a static host that has no SPA fallback
rule, and a user navigates directly to a client-side route (e.g. `/discover`).

**Formal Specification:**

```
FUNCTION isBugCondition_2(input)
  INPUT: input — an HTTP request received by the static file server
  OUTPUT: boolean

  RETURN input.requestPath NOT IN physicalFiles(dist/)
         AND input.spaFallbackConfigured = false
         AND input.requestPath MATCHES A_CLIENT_SIDE_ROUTE
END FUNCTION
```

#### Examples

- **Direct navigation to /discover (no auth)**: User opens
  `https://myapp.netlify.app/discover` in a fresh tab. Static server has no fallback rule.
  Server returns HTTP 404. Browser displays server's default error page. React app never loads.
  **Expected**: Server serves `index.html`; React Router renders `RequireAuth`, which
  redirects to `/auth` with `state.from = '/discover'`.

- **Shared link to /match/123**: User pastes a profile link into a browser. Same as above —
  HTTP 404 before React starts.
  **Expected**: Server serves `index.html`; app loads and evaluates the route.

- **Development (dev server)**: Vite's dev server already handles this via its built-in
  `historyApiFallback`. No change needed for dev.

---

### Defensive Fix — `catch` Block Safety in `auth.tsx`

#### Context

The `load()` function in `AuthProvider` has this structure:

```
try {
  const p = await fetchProfileById(id)
  ...
} catch {
  setProfileId(null)
  setProfile(null)
  // ← setIsLoading(false) is missing here
} finally {
  setIsLoading(false)   // ← this already runs, so the gap is currently safe
}
```

The `finally` block already ensures `setIsLoading(false)` is always called. The `catch` block
not calling it is harmless at runtime. However, adding it explicitly to the `catch` block is a
safety net: if the `finally` block is ever removed or restructured, the loading state would be
stuck at `true`. The defensive addition costs one line and eliminates this fragile dependency.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Form validation (empty fields, password < 6 chars, missing name/username on sign-up) must
  continue to display correct error messages and block submission.
- The loading spinner on the submit button must appear while `signIn` / `signUp` is in flight.
- Error messages returned by `signIn` / `signUp` must continue to be displayed to the user.
- The tab toggle between "Sign In" and "Sign Up" must continue to reset error state and swap
  form fields.
- The "Back to home" button must continue to navigate to `/` using the existing `navigate('/')`
  call (already correct; must not be changed).
- Sign-up must still redirect to `/onboarding` — the destination is unchanged, only the
  mechanism changes.
- Sign-in must still redirect to the `from` path (defaulting to `/discover`) — destination
  unchanged.
- The `finally { setLoading(false) }` cleanup in `AuthPage.handleSubmit` must still execute
  after both success and failure paths.
- `RequireAuth` for authenticated users must continue to render the protected page immediately
  (no regression in the happy path).
- Genuinely non-existent routes (e.g. `/gibberish`) must still render `NotFoundPage` via the
  wildcard `*` route.
- `AuthProvider.load()` behavior for valid sessions, invalid sessions, and no-session cases
  must remain identical.

**Scope:**

All inputs that do NOT involve a successful completion of the auth form submission, a direct
hard-load of a protected URL in production, or an unexpected exception in `load()` are
completely unaffected by this fix. This includes:

- Failed sign-in or sign-up attempts (wrong password, taken username, network error).
- Typing in form inputs, toggling password visibility, switching tabs.
- Clicking "Back to home".
- Normal in-app navigation between protected routes after sign-in.
- The dev server (Vite already handles SPA routing in dev).

## Hypothesized Root Cause

1. **`window.location.href` instead of `navigate()` in `AuthPage.tsx`** — Both redirect sites
   inside `handleSubmit` use the imperative `window.location.href` assignment. `useNavigate` is
   already imported and called at the top of the component; the fix is two targeted one-line
   replacements. No new imports or refactoring needed.

2. **No SPA fallback in production deployment config** — The `public/` directory has no
   `_redirects` file, and there is no `vercel.json`. Without one of these, any static host
   that serves the Vite build output will return a real HTTP 404 for routes like `/discover`
   rather than serving `index.html`. The Vite config (`vite.config.ts`) correctly leaves
   `server.historyApiFallback` to its default (enabled in dev), so no Vite change is needed.

3. **`catch` block in `auth.tsx` does not call `setIsLoading(false)`** — This is a defensive
   concern. The `finally` block already covers it, so there is no live bug here, but making
   the `catch` block self-contained removes a latent fragility.

## Correctness Properties

Property 1: Bug Condition — Post-Auth Client-Side Navigation

_For any_ successful sign-in or sign-up where `isBugCondition_1(input)` is true (auth
succeeded and a redirect is about to happen), the fixed `handleSubmit` function SHALL use
React Router's `navigate()` to perform the redirect, keeping the React app alive in-process
so that `RequireAuth` can immediately resolve `isSignedIn = true` and render the target
protected page without a full browser reload.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Unaffected Interactions Remain Identical

_For any_ input where `isBugCondition_1(input)` is false (the auth attempt failed, or the
interaction is anything other than a successful auth completion), the fixed `handleSubmit` and
all other `AuthPage` interactions SHALL produce exactly the same behavior as the original code,
preserving all form validation, error handling, loading state, tab switching, and the "Back to
home" navigation.

**Validates: Requirements 3.1, 3.2, 3.3**

Property 3: SPA Route Availability in Production

_For any_ request to a valid client-side route path (e.g. `/discover`, `/messages`) on the
production static host, the server SHALL serve `index.html` so that React Router handles the
route, and `RequireAuth` SHALL redirect unauthenticated users to `/auth` with the intended path
in `location.state.from`.

**Validates: Requirements 2.5, 2.6**

Property 4: Loading State Completion

_For any_ execution of `AuthProvider.load()` — including paths where an unexpected exception is
thrown — the function SHALL always set `isLoading` to `false` before returning, so that
`RequireAuth` always completes its loading phase and proceeds to evaluate sign-in state.

**Validates: Requirements 2.4**

## Fix Implementation

### Changes Required

---

**Change 1 of 3**

**File**: `src/pages/AuthPage.tsx`

**Function**: `handleSubmit`

**Replace hard reload for sign-up redirect:**

```diff
- if (user) { window.location.href = '/onboarding'; return }
+ if (user) { navigate('/onboarding'); return }
```

**Replace hard reload for sign-in redirect:**

```diff
- if (user) { window.location.href = from; return }
+ if (user) { navigate(from); return }
```

The `navigate` function is already available from `useNavigate()` called at the top of the
component. No new imports or refactoring required.

---

**Change 2 of 3**

**File**: `src/lib/auth.tsx`

**Function**: `AuthProvider` → `load` (inner async function)

**Add defensive `setIsLoading(false)` to the `catch` block:**

```diff
  } catch {
    setProfileId(null)
    setProfile(null)
+   setIsLoading(false)  // defensive: finally already handles this, but belt-and-suspenders
  } finally {
    setIsLoading(false)
  }
```

This is a pure safety-net addition. The `finally` block already calls `setIsLoading(false)`,
so behavior is unchanged — but the `catch` block is now self-contained and resilient to future
structural changes to the try/catch/finally.

---

**Change 3 of 3**

**File**: `public/_redirects` (new file — for Netlify deployments)

**Content:**

```
/* /index.html 200
```

This single line tells Netlify's CDN to serve `index.html` with a 200 status for every request
path that does not match a physical file in `dist/`. Vite copies the entire `public/` directory
into `dist/` during the build, so `_redirects` will be at `dist/_redirects` automatically.

**For Vercel deployments**, create `vercel.json` at the project root instead:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**For GitHub Pages / other hosts**, refer to that host's documentation for SPA fallback
configuration (e.g., a `404.html` redirect trick, or `--single` flag on `serve`).

**No changes needed to:**
- `vite.config.ts` — Vite's dev server already handles SPA routing via its default
  `historyApiFallback`.
- `src/App.tsx` — `RequireAuth` and routing are already correctly implemented.
- Any other source file.

## Testing Strategy

### Validation Approach

Testing follows two phases: first, run against unfixed code to surface counterexamples and
confirm root causes; then verify the fix produces correct behavior and preserves all unrelated
interactions.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate both bugs on the unfixed code and confirm
the root cause analysis.

**Test Plan for Bug 1**: Mount `AuthPage` inside a `MemoryRouter` with mocked `signIn` /
`signUp`. Submit the form with valid credentials. Assert that `navigate` was called with the
correct path, and that `window.location.href` was NOT modified. Run against **unfixed** code to
observe that `navigate` is never called and `window.location.href` is assigned instead.

**Test Cases for Bug 1:**

1. **Sign-In Redirect Test**: Mock `signIn` to resolve with `{ user: mockProfile, error: null }`.
   Submit the sign-in form. Assert `navigate('/discover')` was called.
   _(Will fail on unfixed code — `window.location.href` is used instead.)_

2. **Sign-In with Custom `from` Test**: Mount with `location.state = { from: '/messages' }`.
   Submit sign-in. Assert `navigate('/messages')` was called.
   _(Will fail on unfixed code.)_

3. **Sign-Up Redirect Test**: Switch to sign-up tab. Fill all fields. Mock `signUp` to resolve
   with `{ user: mockProfile, error: null }`. Submit. Assert `navigate('/onboarding')` was
   called.
   _(Will fail on unfixed code.)_

4. **`window.location.href` Not Modified**: After a successful sign-in, assert that
   `window.location.href` remains at its jsdom default (e.g. `about:blank`).
   _(Will fail on unfixed code.)_

**Expected Counterexamples for Bug 1:**
- `navigate` is never called; `window.location.href` receives the redirect path.
- Confirms root cause: hard reload via `window.location.href`.

**Test Plan for Bug 2**: This is a deployment-level concern not testable by unit tests.
Validation is done by deploying the app to a staging environment and verifying:
- Before adding `_redirects`: direct navigation to `/discover` returns HTTP 404.
- After adding `_redirects`: direct navigation to `/discover` serves `index.html` (HTTP 200)
  and React Router redirects to `/auth`.

---

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed functions produce
the expected behavior.

**Pseudocode — Bug 1:**

```
FOR ALL input WHERE isBugCondition_1(input) DO
  result := handleSubmit_fixed(input)
  ASSERT navigate WAS CALLED WITH expectedPath(input)
  ASSERT window.location.href WAS NOT MODIFIED
END FOR
```

**Pseudocode — Bug 2:**

```
FOR ALL request WHERE isBugCondition_2(request) DO
  response := staticServer_withFallback(request)
  ASSERT response.statusCode = 200
  ASSERT response.body = index.html
END FOR
```

**Pseudocode — Defensive `catch` (Bug 3):**

```
GIVEN load() throws an unexpected exception
  result := AuthProvider.load()
  ASSERT isLoading = false
  ASSERT navigate is not blocked by spinner
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed
`handleSubmit` and `load()` produce the same observable behavior as the originals.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition_1(input) DO
  ASSERT handleSubmit_original(input) PRODUCES SAME EFFECTS AS handleSubmit_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many combinations of form state (email, password, name, tab, error conditions).
- It ensures no incidental side effects were introduced in the non-redirect code paths.
- It provides strong guarantees that validation, error display, and loading state are unaffected.

**Test Cases:**

1. **Failed Sign-In Preservation**: Mock `signIn` to return an error string. Submit.
   Assert the error message is shown and `navigate` is NOT called.

2. **Form Validation Preservation**: Submit with an empty email field. Assert validation error
   is shown and neither `navigate` nor `window.location.href` is triggered.

3. **Loading State Preservation**: While `signIn` is in flight, assert `isLoading = true` and
   the button shows the loading indicator.

4. **Tab Switch Preservation**: Toggle from sign-in to sign-up. Assert error state is cleared
   and the sign-up fields appear.

5. **`load()` Happy Path Preservation**: Provide a valid `localStorage` session ID and a mocked
   successful `fetchProfileById`. Assert `isLoading` transitions to `false` and `isSignedIn`
   becomes `true`. (Unchanged behavior; regression check.)

---

### Unit Tests

- Assert `navigate('/discover')` is called after a mocked successful sign-in (default `from`).
- Assert `navigate('/messages')` is called when `location.state.from = '/messages'`.
- Assert `navigate('/onboarding')` is called after a mocked successful sign-up.
- Assert `navigate` is NOT called when `signIn` returns an error.
- Assert `navigate` is NOT called when form validation fails (empty fields, short password).
- Assert `setIsLoading(false)` is called even when `fetchProfileById` throws unexpectedly.

### Property-Based Tests

- Generate random valid credential objects; verify a mocked successful `signIn` always results
  in `navigate` being called exactly once with the correct `from` path and never with
  `window.location.href`.
- Generate random invalid form states (empty fields, passwords < 6 chars); verify `navigate` is
  never called and `error` state is always set.
- Generate random `from` paths (any string beginning with `/`); verify `navigate` is called
  with that exact path after a mocked successful sign-in.

### Integration Tests

- Mount the full app with `MemoryRouter` starting at `/auth` with `state = { from: '/discover' }`.
  Mock auth to succeed. Submit sign-in form. Assert the rendered route is `DiscoverPage` — not
  `NotFoundPage` and not a redirect back to `/auth`.
- Test the sign-up → onboarding flow end-to-end: mock `signUp` to succeed, assert
  `OnboardingPage` renders without a page reload.
- Test that protected routes are accessible immediately after the in-process navigation, without
  needing to wait for a remount or re-fetch of auth state.
- Deployment smoke test: after deploying to staging with `_redirects` in place, assert that
  `GET /discover` returns HTTP 200 with `Content-Type: text/html` and that the React app
  evaluates the route correctly.
