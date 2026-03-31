# API HTTP Status Code Reference

**Last Updated**: 2026-03-31
**Standard**: RFC 7231 + Domain-Specific Conventions

All error responses follow this RFC 7807-like format:
```json
{
  "type": "about:blank",
  "title": "HTTP Status Name",
  "status": 400,
  "detail": "Human-readable error message",
  "instance": "/api/endpoint/path",
  "correlationId": "uuid-for-tracing",
  "field": "optional-field-name"
}
```

---

## 2xx Success

### 200 OK
**When**: Standard successful response
**Example**: GET /users, POST /login, PATCH /projects/:id

**Response**:
```json
{
  "data": { /* resource or array */ },
  "meta": { "timestamp": "ISO_DATE" }
}
```

### 201 Created
**When**: Resource successfully created
**Example**: POST /projects, POST /reurb

**Response**: Same as 200 + Location header (optional)

### 204 No Content
**When**: Successful operation with no response body
**Example**: DELETE /projects/:id, DELETE /map-features/:id

---

## 4xx Client Errors

### 400 Bad Request
**When**: Validation error, malformed request, missing required fields
**Used by**: `ValidationException`

**Examples**:
- Invalid email format
- Missing required field
- Invalid JSON body
- Query parameter out of range

**Code**:
```typescript
throw new ValidationException('Email format invalid', {
  field: 'email',
  pattern: 'user@example.com'
});
```

**Response**:
```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "Email format invalid",
  "errors": {
    "email": "Invalid format"
  }
}
```

---

### 401 Unauthorized
**When**: Missing, expired, or invalid authentication token
**Used by**: `AuthenticationException`, `JwtAuthGuard`

**Examples**:
- No Authorization header
- Invalid JWT signature
- Expired access token (request new one via /auth/refresh)
- Malformed Bearer token

**Code**:
```typescript
throw new AuthenticationException('Token expired, please refresh');
```

**Response**:
```json
{
  "status": 401,
  "title": "Unauthorized",
  "detail": "Token expired, please refresh"
}
```

---

### 403 Forbidden
**When**: Authenticated but insufficient permissions (RBAC)
**Used by**: `AccessDeniedException`, `RolesGuard`

**Examples**:
- User lacks required role (e.g., OPERADOR trying ADMIN action)
- User can read but not write
- Tenant isolation violation

**Code**:
```typescript
throw new AccessDeniedException('Admin role required', 'ADMIN');
```

**Response**:
```json
{
  "status": 403,
  "title": "Forbidden",
  "detail": "Admin role required",
  "requiredRole": "ADMIN"
}
```

---

### 404 Not Found
**When**: Resource doesn't exist
**Used by**: `ResourceNotFoundException`

**Examples**:
- GET /projects/999 (project doesn't exist)
- GET /reurb/unknown-id
- DELETE /parcels/invalid

**Code**:
```typescript
throw new ResourceNotFoundException('Parcel', parcelId);
// Renders: "Parcel with id "123" not found"
```

**Response**:
```json
{
  "status": 404,
  "title": "Not Found",
  "detail": "Parcel with id \"123\" not found"
}
```

---

### 409 Conflict
**When**: State conflict, duplicate resource, or invalid state transition
**Used by**: `DuplicateResourceException`, `ConflictStateException`

**Subcase 1: Duplicate Resource**
```typescript
throw new DuplicateResourceException('Project slug already exists', 'slug');
```

**Subcase 2: State Conflict**
```typescript
throw new ConflictStateException('draft', 'publish');
// Renders: "Cannot publish while in "draft" state"
```

**Response**:
```json
{
  "status": 409,
  "title": "Conflict",
  "detail": "Cannot publish while in 'draft' state"
}
```

---

### 422 Unprocessable Entity
**When**: Syntactically valid but business rule violation
**Used by**: `BusinessRuleException`

**Examples**:
- Can't delete project with active processes
- Can't mark parcel approved (missing survey)
- PGV calculation invalid (factor range exceeded)

**Code**:
```typescript
throw new BusinessRuleException('Cannot delete project with active processes', {
  activeProcessCount: 3,
  projectId: '123'
});
```

**Response**:
```json
{
  "status": 422,
  "title": "Unprocessable Entity",
  "detail": "Cannot delete project with active processes",
  "details": {
    "activeProcessCount": 3,
    "projectId": "123"
  }
}
```

---

## 5xx Server Errors

### 500 Internal Server Error
**When**: Genuinely unexpected error, exception not caught
**Logged with**: Full stack trace + correlation ID
**Should NOT use for**:
- Missing resources (use 404)
- Validation errors (use 400)
- State conflicts (use 409)
- Permission issues (use 403)

**Example causes** (should be rare):
- Database connection failure
- Unexpected null pointer
- Third-party service timeout
- File system error

**Code**:
```typescript
try {
  await someOperation();
} catch (error) {
  // Log with correlation ID
  this.logger.error('Unexpected error', error, correlationId);
  throw new InternalServerErrorException('An unexpected error occurred');
}
```

**Response**:
```json
{
  "status": 500,
  "title": "Internal Server Error",
  "detail": "An unexpected error occurred",
  "correlationId": "abc-def-123"
}
```

**Client Action**: Report with correlationId to support team

---

## Module-Specific Conventions

### Authentication (`/auth`)
- `POST /auth/login` → 200 (success), 400 (invalid creds)
- `POST /auth/refresh` → 200 (new token), 401 (expired refresh)
- `POST /auth/logout` → 204 (no content)
- `POST /auth/forgot-password` → 200 (OK, even if email not found—privacy)
- `POST /auth/reset-password` → 200 (reset ok), 400 (invalid token)

### Tenants
- `GET /tenants` → 200 (list), 401 (auth required)
- `POST /tenants` → 201 (created), 400 (validation), 409 (duplicate slug)
- `PATCH /tenants/:id` → 200 (updated), 404 (not found), 403 (access denied)

### REURB
- `POST /reurb` → 201, 400 (validation), 422 (project already exists)
- `GET /reurb/:id` → 200, 404
- `PATCH /reurb/:id/families` → 200, 400, 404, 409 (state conflict)
- `GET /reurb/:id/download` → 200 (ZIP), 404, 422 (not ready to export)

### Maps & Geometries
- `POST /map-features` → 201, 400 (invalid GeoJSON), 422 (geometry overlaps)
- `GET /map-features/geojson` → 200 (FeatureCollection)
- `DELETE /map-features/:id` → 204, 404

### Integrations
- `POST /tax-integration/test-connection` → 200 (OK), 400 (config invalid), 422 (test failed)
- `POST /tax-integration/sync` → 200 (queued), 409 (sync already running)

---

## Testing Status Codes

### Unit Test Example
```typescript
it('should return 404 for non-existent parcel', async () => {
  const response = await request(app.getHttpServer())
    .get('/ctm/parcels/999')
    .set('x-tenant-id', tenantId)
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(404);
  expect(response.body.detail).toContain('Parcel');
});

it('should return 422 for state conflict', async () => {
  const response = await request(app.getHttpServer())
    .patch(`/reurb/${projectId}/publish`)
    .set('x-tenant-id', tenantId)
    .set('Authorization', `Bearer ${token}`)
    .send({});

  expect(response.status).toBe(409);
  expect(response.body.detail).toContain('draft');
});
```

---

## Migration Guide: Old → New Status Codes

| Old Behavior | New Code | Status | Why |
|---|---|---|---|
| Catch-all 500 | Proper 4xx | 400/401/403/404/409 | Clearer client handling |
| No error detail | Added context | Always explains why | Better debugging |
| Inconsistent format | RFC 7807-like | All responses same shape | Easier parsing |
| Mix of exception types | Standardized | All use custom exceptions | Consistent mapping |

---

## Debugging with Correlation IDs

Every error response includes `correlationId`:
```bash
# Frontend error handling
const error = response.body.correlationId;
console.error(`Error (ID: ${error}): ${response.body.detail}`);

# Backend: find logs
grep -r "abc-def-123" /logs/api.log
```

---

## Summary Table

| Code | Name | When | Exception Class |
|------|------|------|---|
| 200 | OK | Success | N/A |
| 201 | Created | Resource created | N/A |
| 204 | No Content | Success, no body | N/A |
| 400 | Bad Request | Validation error | `ValidationException` |
| 401 | Unauthorized | Missing/invalid auth | `AuthenticationException` |
| 403 | Forbidden | Insufficient permissions | `AccessDeniedException` |
| 404 | Not Found | Resource doesn't exist | `ResourceNotFoundException` |
| 409 | Conflict | Duplicate or state conflict | `DuplicateResourceException` / `ConflictStateException` |
| 422 | Unprocessable Entity | Business rule violation | `BusinessRuleException` |
| 500 | Internal Server Error | Unexpected error | `InternalServerErrorException` |

