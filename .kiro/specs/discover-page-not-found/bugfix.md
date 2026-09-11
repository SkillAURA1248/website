# Bugfix Requirements Document

## Introduction

Two related bugs in the SkillSwap app cause protected routes (e.g. `/discover`) to show
"Page not found" (`NotFoundPage`) instead of the intended page.

**Bug 1 — Post-login hard reload:** After a successful sign-in, `AuthPage` uses
`window.location.href` for the redirect instead of React Router's `navigate()`. A hard
browser reload clears React Router's in-memory state and forces `AuthProvider` to
re-initialize asynchronously. During that window `RequireAuth` cannot confirm the user is
authenticated and either bounces them back to `/auth` or falls through to the wildcard `*`
route, rendering `NotFoundPage`.

**Bug 2 — Direct navigation to a protected route without authentication:** When an
unauthenticated user types a protected URL (e.g. `/discover`) directly into the browser
address bar, they see `NotFoundPage` instead of being redirected to `/auth`. This has two
contributing causes:
- In the dev server, Vite's default SPA fallback serves `index.html` for unknown paths, so
  React Router does receive the request — but the `catch` block in `AuthProvider.load()`
  omits `setIsLoading(false)`, meaning an unexpected exception leaves `isLoading` stuck at
  `true` permanently and `RequireAuth` never reaches the redirect logic.
- In a production deployment without an explicit SPA fallback rule (e.g. on a static host
  that returns a real HTTP 404 for `/discover`), the server responds before React loads,
  and the app never starts — no redirect is possible.

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — Post-login hard reload**

1.1 WHEN a user submits valid credentials on the Sign In form THEN the system
    performs a hard browser navigation (`window.location.href`) to `/discover`,
    discarding all React Router in-memory state.

1.2 WHEN the hard reload completes and `AuthProvider` starts re-hydrating the
    session asynchronously THEN `RequireAuth` treats the user as unauthenticated
    while `isLoading` is `true` and may redirect away from `/discover` before
    the profile fetch resolves.

1.3 WHEN the React Router `location.state.from` value is lost due to the hard
    reload THEN the fallback destination defaults to `/discover`, but the route
    guard race condition causes `RequireAuth` to redirect back to `/auth` (with
    `state.from = '/discover'` again), creating a redirect loop or landing on
    `NotFoundPage` via the wildcard `*` route.

**Bug 2 — Direct navigation without authentication**

1.4 WHEN an unauthenticated user navigates directly to a protected route (e.g.
    `/discover`) in the browser address bar AND `AuthProvider.load()` throws an
    unexpected exception THEN `setIsLoading(false)` is never called (the `catch`
    block does not reset loading state), `isLoading` stays `true` indefinitely,
    and `RequireAuth` renders the loading spinner forever — never redirecting to
    `/auth`.

1.5 WHEN an unauthenticated user navigates directly to a protected route in a
    production environment where the static file server is not configured with an
    SPA fallback THEN the server returns an HTTP 404 response for that path before
    the React app loads, so the browser displays a server-level "not found" page
    and `RequireAuth` never executes.

### Expected Behavior (Correct)

**Bug 1 — Post-login hard reload**

2.1 WHEN a user submits valid credentials on the Sign In form THEN the system
    SHALL use React Router's `navigate()` to perform a client-side navigation to
    the intended destination, preserving router state and avoiding a full page
    reload.

2.2 WHEN a client-side navigation to `/discover` occurs after successful sign-in
    THEN `RequireAuth` SHALL recognise the user as authenticated (because auth
    state is already set in memory) and SHALL render `DiscoverPage` without
    an intermediate redirect.

2.3 WHEN the `location.state.from` value is present in router state THEN the
    system SHALL navigate to that stored path after sign-in, so users are
    returned to the page they originally tried to access.

**Bug 2 — Direct navigation without authentication**

2.4 WHEN `AuthProvider.load()` encounters any exception (including unexpected
    ones) THEN the system SHALL call `setIsLoading(false)` in all code paths
    (including the `catch` block) so that `RequireAuth` always completes its
    loading phase and can proceed to evaluate sign-in state.

2.5 WHEN an unauthenticated user navigates directly to a protected route (e.g.
    `/discover`) and `isLoading` resolves to `false` with `isSignedIn` as `false`
    THEN `RequireAuth` SHALL redirect the user to `/auth` with the intended path
    stored in `location.state.from`.

2.6 WHEN the app is deployed to a production static file server THEN the server
    SHALL be configured with an SPA fallback rule that serves `index.html` for all
    unmatched paths, so React Router — not the server — handles unknown routes.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user submits valid sign-up credentials THEN the system SHALL CONTINUE
    TO navigate to `/onboarding` after account creation.

3.2 WHEN an unauthenticated user attempts to access a protected route THEN the
    system SHALL CONTINUE TO redirect them to `/auth` with the intended path
    stored in `location.state.from`.

3.3 WHEN a user visits `/auth` directly without a prior protected-route redirect
    THEN the system SHALL CONTINUE TO default the post-login destination to
    `/discover`.

3.4 WHEN a signed-in user navigates to any protected route (e.g., `/messages`,
    `/profile`, `/settings`) THEN the system SHALL CONTINUE TO render the
    correct page without showing `NotFoundPage`.

3.5 WHEN the Supabase session stored in `localStorage` is invalid or expired
    THEN the system SHALL CONTINUE TO clear the session, redirect to `/auth`,
    and NOT show `NotFoundPage`.

3.6 WHEN a signed-in user with a valid session directly navigates to a protected
    route THEN the system SHALL CONTINUE TO resolve the session via
    `fetchProfileById` and render the correct page once loading completes.

3.7 WHEN a user navigates to a genuinely non-existent route (e.g. `/gibberish`)
    THEN the system SHALL CONTINUE TO render `NotFoundPage` via the wildcard `*`
    route.
