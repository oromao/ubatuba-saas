# Institutional Identity Readiness

## Current Status

The platform is ready for institutional handoff demonstrations and portal coexistence, but not yet for production federation with a real municipal identity provider.

## What is already ready

- OIDC-ready authorize/callback flow
- Portal exchange with signed handoff token
- Local login fallback
- Logout coherence
- Session context endpoint
- Audit events for handoff and authorization
- Institutional readiness summary exposed in the API and UI

## What is still external

- Real municipal IdP via OIDC or SAML
- Client registration and redirect URI management by the municipality
- Issuer/JWKS discovery and trust management
- Federated logout to the external provider

## Claims currently mapped

- `tenantSlug`
- `email`
- `roleHint`
- `department`
- `state`

## Flow that can be shown today

1. Portal or integration hub generates a signed handoff.
2. Browser opens the institutional callback.
3. Callback exchanges the code for local tokens.
4. App session is created with tenant and role context.
5. RBAC and tenant guard continue to apply.
6. Logout clears the local session.

## Honest licitation position

This is strong enough to prove coexistence and demo readiness.
It is not yet a completed municipal federation against a live IdP.

