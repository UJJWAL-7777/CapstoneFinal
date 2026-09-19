# LegalConnect

Legal-tech platform connecting clients with verified advocates, built around case management.

```
legalconnect/
├── backend/    Node + Express + MongoDB (routes → controllers → services → models → middleware)
└── frontend/   React + Vite + Tailwind (pages → components → services → hooks/context → routes)
```

## Build status

| # | Module | Status |
|---|--------|--------|
| 1 | Project setup | Done |
| 2 | Database (User, ClientProfile, AdvocateProfile, AuditLog) | Done (remaining models arrive with their modules) |
| 3 | Authentication / RBAC | Done |
| 4-24 | Profiles, search, verification, ... deployment | Next |

## Quick start

Requirements: Node 18+, MongoDB running locally or an Atlas URI.

```bash
# Backend
cd backend
cp .env.example .env        # set MONGO_URI and a long random JWT_SECRET
npm install
npm run seed:admin          # creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Backend tests: `cd backend && npm test`

## Auth API

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | /api/auth/register | Public | `role` must be `client` or `advocate`. Admins cannot self-register. |
| POST | /api/auth/login | Public | Generic error on failure, suspended accounts blocked |
| POST | /api/auth/logout | Authenticated | Writes an audit log entry |
| GET | /api/auth/me | Authenticated | User + role profile |
| PATCH | /api/auth/change-password | Authenticated | Invalidates all older tokens, returns a fresh one |

Responses use `{ success, data }` or `{ success: false, message, code, errors? }`.

## Security notes for this module

- Passwords hashed with bcryptjs (12 rounds), never returned (`select: false` + `toJSON` strip).
- Every protected request re-loads the user, so suspension takes effect immediately, and `tokenVersion` lets password changes revoke older JWTs.
- Zod schemas strip unknown fields, which blocks mass assignment such as `role: "admin"`.
- Rate limits: global and a stricter limiter on login/register.
- The JWT is kept in `localStorage` for simplicity. It is exposed to XSS, so the hardened option for the deployment step is an httpOnly cookie plus CSRF protection.
