# LegalConnect — Core Web Application

The core full-stack platform of LegalConnect, containing the Express REST API backend and the React Vite single-page application.

```
legalconnect/
├── backend/    # Node.js + Express + MongoDB + Socket.IO + WebRTC
└── frontend/   # React 18 + Vite + Tailwind CSS + Lucide Icons
```

---

## 🚀 Module Overview & Status

| Module | Feature Set | Status |
|---|---|---|
| **01. Authentication & RBAC** | JWT authentication, role guards (Client, Advocate, Admin), bcrypt password hashing, token revocation | ✅ Complete |
| **02. Advocate Discovery** | Multi-attribute search, debounced filtering by practice area, city, experience, fee range, and ratings | ✅ Complete |
| **03. Bar Council Verification** | Credential submission, document upload, admin verification workflow, and verified badges | ✅ Complete |
| **04. Consultations & Scheduling** | Calendar slot booking, multi-mode selection (Video, Chat, In-Person), and payment handling | ✅ Complete |
| **05. WebRTC Video Calling** | 1-to-1 browser video calling with mic/camera toggle and room controls | ✅ Complete |
| **06. Case Workspaces** | Stage tracker (Opened to Closed), client-advocate document vault, hearing dates, and task lists | ✅ Complete |
| **07. Real-Time Case Messaging** | Socket.IO private chat rooms with typing indicators and timestamped history | ✅ Complete |
| **08. AI Legal Notice Generator** | Automated notice generator with statutory clauses (NI Act 138, Eviction, Contract Breach) | ✅ Complete |
| **09. Devil's Advocate Engine** | Opposing counsel counter-analysis, loophole detection, and rebuttal strategies | ✅ Complete |
| **10. LexBot AI Legal Assistant** | Trilingual (English, Hindi, Hinglish), voice speech input/output, BNS 2023 vs IPC engine | ✅ Complete |
| **11. Supreme Court Landmark Hub** | Ratio decidendi, legal questions, and citation guides for key constitutional precedents | ✅ Complete |
| **12. Admin Control Center** | Platform telemetry, user management, audit logs, and live maintenance/announcement broadcasts | ✅ Complete |

---

## 🛠️ Quick Start

### 1. Backend (`/backend`)
```bash
cd backend
cp .env.example .env        # Set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed:admin          # Creates default admin user
npm run dev                 # Starts API on http://localhost:5000
```

### 2. Frontend (`/frontend`)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # Starts Vite server on http://localhost:5173
```

---

## 🔒 Security Architecture
- **Password Protection**: Passwords hashed with bcryptjs (12 salt rounds), never returned in user payloads.
- **Role-Based Access Control**: Middleware verifies active status and roles on every protected request. Suspensions take effect in real time.
- **Input Sanitization**: Strict Zod schemas strip unknown parameters, preventing mass assignment vulnerabilities.
- **Zero-Dependency Rate Limiting**: In-memory rate limiting shields sensitive routes from brute-force attempts.
- **Socket Isolation**: Case chat rooms are authenticated via JWT, strictly isolating messages to verified case participants.
