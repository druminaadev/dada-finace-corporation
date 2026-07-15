# SECURITY.md — Loan Management Backend

This document describes every security measure applied to the backend.

---

## 1. Authentication & Authorization

### JWT Token Strategy
- **Access token**: 15-minute expiry, signed with `HS256`, payload contains only `userId` and `role`
- **Refresh token**: 7-day expiry, includes a `jti` (JWT ID) UUID to make every token unique
- **Token rotation**: On every `/auth/refresh` call, a new refresh token is issued and the old one is invalidated in the DB. If a previously-used token is presented (reuse attack), all tokens for that user are immediately revoked
- **Storage**: Refresh token is stored in an `httpOnly`, `secure`, `sameSite=strict` cookie scoped to `/api/v1/auth/refresh` only. It is **never** returned in the response body
- **Algorithm pinned**: `jwt.verify` explicitly sets `algorithms: ['HS256']` to prevent algorithm confusion attacks

### Password Hashing
- `bcryptjs` with **12 salt rounds** (increased from original 10)
- Passwords are never logged, never returned in API responses, never stored in plain text

### Account Lockout
- After **5 consecutive failed login attempts**, the account is locked for **15 minutes**
- Lockout state stored in `loginAttempts` and `lockedUntil` fields on the `User` model
- Counters reset to 0 on successful login
- Timing attack prevention: `bcrypt.compare` is always called even when the user does not exist (using a dummy hash)

### Role-Based Access Control (RBAC)
- Three roles: `ADMIN`, `EMPLOYEE`, `USER`
- Every route is protected with `authenticate` + `authorize(...roles)` middleware
- `authorize` is applied per-route, not globally, to allow fine-grained control
- Frontend permission checks **do not replace** backend authorization

---

## 2. Input Validation & Sanitization

### Zod Validation
- All request bodies validated with **Zod schemas** (migrated from Joi)
- `.strict()` on all schemas — unknown fields are rejected, not silently stripped
- Schemas enforce: type coercion, min/max lengths, regex patterns, enum whitelists
- Validation applied to `body`, `query`, and `params` as appropriate

### XSS Sanitization
- All string values are passed through the `xss` library before validation
- Applied recursively to nested objects and arrays in `validate` middleware
- Runs **before** Zod parsing so sanitized values are what gets stored

### SQL Injection
- Prisma ORM uses parameterized queries exclusively
- The one raw SQL query in `report.service.js` (overdue by customer) has been **replaced** with application-layer aggregation using Prisma ORM queries
- No string concatenation into any query

---

## 3. Rate Limiting & Brute Force Protection

| Endpoint Group | Window | Max Requests |
|---|---|---|
| All `/api/*` routes | 15 min | 100 |
| `/api/v1/auth/*` | 15 min | 5 |
| `/api/v1/loan-application/otp/*` | 15 min | 5 |

- `express-rate-limit` with `standardHeaders: true`, `legacyHeaders: false`
- Auth limiter key includes both IP and email to prevent distributed attacks
- Health check endpoint is excluded from rate limiting

---

## 4. HTTP Security Headers (Helmet)

All headers configured via `helmet` v7:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'none'` — API-only, no browser rendering |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Referrer-Policy` | `no-referrer` |
| `X-Powered-By` | Removed |
| `Cross-Origin-Embedder-Policy` | Enabled |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `Permissions-Policy` | Restrictive defaults via helmet |

---

## 5. CORS

- Origin whitelist loaded from `CORS_ORIGIN` env var (comma-separated for multiple origins)
- In production, requests with no `Origin` header are rejected
- Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allowed headers: `Content-Type, Authorization, X-Request-Id, X-Idempotency-Key`
- `credentials: true` only for whitelisted origins
- Preflight cache: 24 hours (`maxAge: 86400`)

---

## 6. File Upload Security

- **MIME whitelist**: `image/jpeg`, `image/png`, `application/pdf` only
- **Extension whitelist**: `.jpg`, `.jpeg`, `.png`, `.pdf` only
- **Magic-byte validation**: After multer saves the file, `validateUploadedFiles` middleware reads the first 8 bytes and verifies the file signature matches the declared MIME type. Mismatched files are deleted immediately
- **UUID filenames**: All uploaded files are renamed to `uuid4 + extension`. Original filenames are never used or stored as the serving name
- **File size limit**: 5 MB per file, 10 files per request
- **Upload directory**: Fixed server-side path — never derived from user input
- **No static serving**: The `/uploads` static route has been removed. Files are served only via the authenticated `/api/v1/documents/download/:id` endpoint which streams the file
- **Path traversal prevention**: `safeResolvePath()` in `document.service.js` resolves the absolute path and verifies it starts with `UPLOADS_ROOT` before any file operation

---

## 7. Error Handling & Logging

### Error Handler
- Operational errors (`AppError`) return their message and status code
- Prisma errors are mapped to safe HTTP responses (no DB error codes exposed to client)
- Unknown/programming errors always return `500 Internal server error` — no stack traces, no internal details
- All errors are logged internally with full stack trace via Winston

### Winston Logger
- Structured JSON logs with timestamp
- Daily rotating log files (30-day retention, 20 MB max per file)
- Separate `auth.log` file for all authentication events
- Console output in development only
- Auth events log: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `TOKEN_REFRESH`, `ACCOUNT_LOCKED` — each with IP and masked email

### Morgan HTTP Logging
- `combined` format in production, `dev` in development
- Writes to Winston stream (not directly to console)
- Health check endpoint excluded from logs

### Request ID
- Every request gets a UUID (`X-Request-Id` response header)
- Included in all API responses for client-side traceability
- Included in all error logs for correlation

---

## 8. Environment & Secrets

- **Fail-fast validation**: `config/env.js` checks all required env vars on startup. Server refuses to start if any are missing
- **Weak secret detection**: In production, JWT secrets shorter than 32 characters cause immediate exit
- **`.env.example`**: Contains only placeholder values — no real secrets
- **Never logged**: Env vars are never printed to logs or console
- **Secret generation**: Use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` for JWT secrets

---

## 9. Database Security

- **Least-privilege DB user**: The application DB user should have only `SELECT`, `INSERT`, `UPDATE` — no `DROP`, `CREATE`, `TRUNCATE`
- **No raw DB errors exposed**: Prisma errors are caught and mapped to generic messages
- **Paginated queries**: All list endpoints enforce `page`/`limit` with a hard cap of 100–500 records
- **Soft deletes**: Users and customers use `isActive=false` instead of hard delete to preserve audit trail
- **No unbounded SELECT**: Every `findMany` call has a `take` limit

---

## 10. API Security

- **API versioning**: All routes are under `/api/v1/`
- **Request ID**: UUID attached to every request via `requestId` middleware
- **Content-Type enforcement**: `POST`, `PUT`, `PATCH` requests without `Content-Type: application/json` are rejected with `415 Unsupported Media Type` (multipart excluded for file uploads)
- **Body size limit**: `express.json({ limit: '10kb' })` — prevents large payload attacks
- **Field whitelisting**: Zod `.strict()` schemas reject unknown fields on all write endpoints
- **UUID validation**: All `:id` params that should be UUIDs are validated before DB queries

---

## 11. Docker & Infrastructure

- **Multi-stage build**: `builder` stage installs all deps and generates Prisma client; `production` stage copies only what's needed
- **Non-root user**: Container runs as `nodeapp` (UID 1001) — never as root
- **Production env**: `NODE_ENV=production` set in Dockerfile
- **Minimal ports**: Only port 5000 exposed
- **Health check**: `HEALTHCHECK` instruction built into Dockerfile
- **No dev dependencies in production image**: `npm ci --omit=dev` in production stage
- **npm audit**: Runs on every `npm ci` via `.npmrc` `audit=true`

---

## 12. Dependency Security

- **Exact versions pinned** in `package.json` (no `^` or `~` ranges)
- **`.npmrc`**: `audit=true`, `save-exact=true`, `fund=false`
- **Removed**: `bcryptjs ^3.0.3` (pre-release) → replaced with stable `2.4.3`
- **Removed**: `express ^5.2.1` (pre-release) → replaced with stable `4.19.2`
- **Removed**: `multer ^2.1.1` (pre-release) → replaced with `1.4.5-lts.1`
- **Added**: `zod`, `xss`, `uuid`, `winston`, `winston-daily-rotate-file`, `cookie-parser`
- Run `npm audit` regularly and address all `high` and `critical` findings

---

## 13. Sensitive Data Handling

- Passwords: never returned in any API response (explicit `select` on all user queries)
- Refresh tokens: never returned in response body (httpOnly cookie only)
- Login attempts / lockout fields: never returned in API responses
- File paths: never returned to client (only UUID filename and metadata)
- Aadhaar / PAN: stored but never logged
- Email in auth logs: partially masked (`ab***@domain.com`)

---

## 14. Known Limitations & Recommendations

| Item | Current State | Recommendation |
|---|---|---|
| Refresh token storage | Single token in DB column | Migrate to Redis for token blacklist + multi-device support |
| File storage | Local disk | Migrate to S3 with pre-signed URLs for production |
| OTP verification | Mock/simulated | Integrate real Aadhaar OTP provider with HTTPS |
| HTTPS | Handled by Nginx | Ensure TLS 1.2+ only, disable TLS 1.0/1.1 in Nginx config |
| Secrets rotation | Manual | Set up automated secret rotation (AWS Secrets Manager / Vault) |
| Dependency scanning | `npm audit` | Add Snyk or Dependabot for automated PR alerts |
| Idempotency keys | Not yet implemented | Add for payment endpoints to prevent double-charging |
