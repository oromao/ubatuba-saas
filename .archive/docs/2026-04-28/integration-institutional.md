# Integration Institutional

## What exists now
- OIDC-ready homologation flow at `/auth/oidc/authorize` and `/auth/oidc/callback`
- Signed portal exchange at `/auth/portal/exchange`
- Portal logout at `/auth/portal/logout`
- Portal start and callback pages at `/portal/oidc/start` and `/portal/oidc/callback`
- Integration hub adapters and OIDC link generation
- Institutional readiness endpoint at `/auth/institutional-readiness`
- Session context endpoint at `/auth/session`

## How it works
1. Portal or integration hub requests an authorize URL.
2. Backend creates a signed authorization code with tenant, email, role hint and expiry.
3. Browser lands on the callback page.
4. Callback exchanges code for session tokens.
5. App loads with RBAC and tenant context.
6. Logout clears the local session; portal logout endpoint can invalidate the handoff token.

## What a real municipal portal would need
- an actual OIDC IdP or SAML federation
- client registration
- redirect URI allowlisting
- refresh/session policy agreed with the municipality
- audit log forwarding if required by procurement

## Honest status
- good for homologation and demo
- enough to prove coexistence
- not yet a production municipal federation
- enough to show a clear institutional handoff story in licitation
