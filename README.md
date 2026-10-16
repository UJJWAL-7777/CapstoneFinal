# ⚖️ LegalConnect — Unified Legal-Tech Platform & AI Jurisprudence Suite

[![Production Live](https://img.shields.io/badge/Production-Live-success?style=for-the-badge&logo=vercel)](https://capstone-final-gamma.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![BNS 2023](https://img.shields.io/badge/Jurisprudence-BNS%202023%20%26%20IPC-orange?style=for-the-badge)](https://www.mha.gov.in)

> **Live Production URL:** [https://capstone-final-gamma.vercel.app](https://capstone-final-gamma.vercel.app)  
> LegalConnect is a next-generation Indian legal-tech ecosystem designed to bridge the justice gap. It unifies **verified advocate discovery**, **end-to-end case management**, **in-browser WebRTC video consultations**, an **AI Legal Notice Generator with Devil's Advocate Counter-Analysis**, and **LexBot** — a trilingual AI statutory legal engine compliant with the **Bharatiya Nyaya Sanhita (BNS 2023)** and erstwhile Indian Penal Code (IPC).

---

## 📌 Table of Contents
1. [Platform Vision & Highlights](#-platform-vision--highlights)
2. [Role-Based Portals & Core Features](#-role-based-portals--core-features)
   - [Client Portal](#1-client-portal)
   - [Advocate Practice Portal](#2-advocate-practice-portal)
   - [Admin Control Center](#3-admin-control-center)
3. [AI Legal Innovations](#-ai-legal-innovations)
   - [AI Legal Notice Generator & Devil's Advocate Engine](#1-ai-legal-notice-generator--devils-advocate-engine)
   - [LexBot AI Legal Assistant (Multilingual & Speech)](#2-lexbot-ai-legal-assistant-multilingual--speech)
   - [Statutory Jurisprudence Database (BNS 2023 vs IPC)](#3-statutory-jurisprudence-database-bns-2023-vs-ipc)
   - [Supreme Court Landmark Precedents Library](#4-supreme-court-landmark-precedents-library)
4. [Architecture & Technology Stack](#-architecture--technology-stack)
5. [Directory Layout](#-directory-layout)
6. [Quick Start & Local Development](#-quick-start--local-development)
7. [Demo Accounts & Test Credentials](#-demo-accounts--test-credentials)
8. [API & Socket.IO Architecture](#-api--socketio-architecture)
9. [Performance & Engineering Highlights](#-performance--engineering-highlights)
10. [Legal Disclaimer & Capstone Credits](#-legal-disclaimer--capstone-credits)

---

## 🌟 Platform Vision & Highlights

India's legal system underwent a historic transformation on **July 1, 2024**, replacing colonial-era criminal laws with the **Bharatiya Nyaya Sanhita (BNS 2023)**, **Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)**, and **Bharatiya Sakshya Adhiniyam (BSA 2023)**. LegalConnect addresses the critical need for citizens and practitioners to navigate this statutory transition, verify Bar Council credentials, manage case lifecycles, and access instant legal reasoning.

- 🏛️ **Bar Council Credential Verification**: Strict document verification for advocates, eliminating unregistered practice.
- ⚡ **Zero-Friction Discovery**: Debounced, multi-parameter search across practice areas, experience, fees, languages, and cities.
- 📹 **1-to-1 WebRTC Video Consultations**: Private, end-to-end encrypted browser video rooms without third-party downloads.
- 🛡️ **Devil's Advocate AI Engine**: Exposes vulnerabilities in legal notice drafts by simulating opposing counsel counter-arguments.
- 🎙️ **Nyaya Bhasha Trilingual AI**: Voice-enabled legal assistant speaking English, हिन्दी (Hindi), and Hinglish with zero external API dependencies.
- ⚡ **Sub-Millisecond UI**: Built with 0-re-render CSS keyframe toast animations, shared Socket.IO connection pooling, and memoized virtual DOM trees.

---

## 👥 Role-Based Portals & Core Features

### 1. Client Portal
- **Interactive Dashboard**: Real-time overview of active legal cases, confirmed consultations, recent alerts, and quick actions.
- **Find Advocates Directory**: Search verified advocates with debounced queries, filters for 12+ practice areas, consultation modes (Video, Chat, In-Person), hourly fee ranges, Bar Council verification status, and ratings.
- **Consultation Booking System**: Book available calendar slots with seamless payment processing, instant booking confirmation, and direct video link generation.
- **WebRTC Video Consultation Room**: Browser-native 1-to-1 video conferencing with camera/mic controls, participant indicators, and session timer.
- **Case Management Workspace**:
  - **Status Tracker**: Visual timeline tracking case stages (Opened → In Progress → Hearing → Resolved → Closed).
  - **Document Vault**: Secure client-advocate document uploads, sharing, and downloads.
  - **Hearing Calendar**: Upcoming court dates with automated reminders.
- **Real-Time Case Chat**: Socket.IO powered messaging room per case with typing indicators and timestamped history.
- **Notifications Hub**: Live WebSocket notifications for case updates, consultation confirmations, and platform alerts.

### 2. Advocate Practice Portal
- **Advocate Dashboard**: Real-time metrics tracking active cases, pending consultation requests, confirmed hearings, client ratings, and total revenue.
- **Availability Calendar**: Configure custom working hours, appointment slots, and blackout dates.
- **Client Directory**: Comprehensive CRM to review past consultations, active clients, and case histories.
- **Case Workspace & Task Assignment**: Schedule court hearings, create procedural tasks, upload pleadings, and communicate securely with clients.
- **Revenue & Earnings Analytics**: Financial breakdown of consultation fees, earnings receipts, and payout histories.
- **Feedback & Review System**: Verified client reviews and star ratings with performance analytics.
- **Professional Credential Badges**: Badges for verified Bar Council registration, top responsiveness, and dispute resolution excellence.

### 3. Admin Control Center
- **Executive Platform Dashboard**: Platform-wide telemetry covering total users, verified advocates, ongoing cases, system health, and gross volume.
- **Advocate Verification Queue**: Review advocate Bar Council enrollment certificates, ID proofs, and experience claims with single-click Approve, Reject, or Request Revision workflows.
- **User Management**: Inspect client and advocate accounts, view activity logs, and toggle account suspensions.
- **Real-Time Maintenance Mode**: Toggle platform maintenance mode with instant Socket.IO broadcast across all connected clients and advocates.
- **Live System Announcement Banners**: Broadcast urgent system advisories, court vacation alerts, or regulatory notices across the platform in real time.
- **Audit Logs & Dispute Reports**: Tamper-evident logging of administrative actions, user changes, and financial events.

---

## 🧠 AI Legal Innovations

### 1. AI Legal Notice Generator & Devil's Advocate Engine
Located at `/client/legal-notice`, this system automates the creation and strategic stress-testing of formal legal notices:
- **Statutory Notice Templates**:
  - Section 138 Negotiable Instruments Act (Cheque Bounce Demand Notice).
  - Eviction & Tenant Recovery Notice (Transfer of Property Act).
  - Breach of Commercial Contract & Liquidated Damages.
  - Defamation Notice under Section 356 BNS 2023.
  - Consumer Protection Deficiency of Service Complaint.
  - Recovery of Unpaid Salary & Employment Dues.
- **Automated Statutory Clauses**: Automatically fills relevant limitation periods (e.g., 15-day statutory demand under Sec 138 NI Act), jurisdictional requirements, and interest claims.
- **😈 Devil's Advocate Counter-Analysis**:
  - Evaluates drafted notices from the perspective of aggressive opposing defense counsel.
  - Detects procedural loopholes (e.g., missed 30-day statutory notice window under NI Act, lack of privity, unliquidated damages).
  - Scores legal vulnerability and outputs actionable rebuttal strategies to fortify the case before dispatch.

---

### 2. LexBot AI Legal Assistant (Multilingual & Speech)
LexBot is a zero-latency, offline-capable legal microservice accessible platform-wide:
- **Trilingual "Nyaya Bhasha"**: Switch seamlessly between **English**, **हिन्दी (Hindi)**, and **Hinglish**.
- **Voice-Enabled Speech**:
  - 🎙️ **Speech-to-Text**: Click the microphone to speak questions in Hindi or English using HTML5 Speech Recognition.
  - 🔊 **Text-to-Speech**: Click the audio speaker icon on any message bubble to listen to the applied legal advice.
- **Role-Aware Context**: Adjusts advice based on whether the active user is a Client, Advocate, or Administrator.
- **Clean UI**: Streamlined interface free of distracting card clutter, featuring inline citations and quick action links.

---

### 3. Statutory Jurisprudence Database (BNS 2023 vs IPC)
LexBot features an in-depth statutory knowledge base comparing the new Bharatiya Nyaya Sanhita against the Indian Penal Code:

| Incident / Scenario | New Law (BNS 2023) | Old Law (IPC 1860) | Statutory Classification & Punishment |
|---|---|---|---|
| **Robbery in Dwelling House** | **Section 309(4) BNS** | Section 392 IPC | **Rigorous Imprisonment up to 14 years + Fine** (Cognizable, Non-Bailable) |
| **House-Breaking by Night** | **Section 331(6) & 332 BNS** | Section 457 & 458 IPC | **Up to 14 years Rigorous Imprisonment + Fine** |
| **Dacoity (5+ Persons in Home)** | **Section 310 BNS** | Section 395 IPC | **Imprisonment for Life (Umar Qaid)** or up to 10 years + fine |
| **Joint Liability for Hurt/Death** | **Section 333 BNS** | Section 459 / 460 IPC | **Imprisonment for Life** for every person conjointly committed |
| **Private Defence to Cause Death** | **Section 41 BNS** | Section 103 IPC | **Statutory right to voluntarily cause death** to robber/night house-breaker in self-defence |
| **Murder** | **Section 103 BNS** | Section 302 IPC | **Death Penalty or Life Imprisonment + Fine** |
| **Attempt to Murder** | **Section 109 BNS** | Section 307 IPC | **Up to 10 years; if hurt caused, Life Imprisonment** |
| **Petty Theft & Trifles Doctrine** | **Section 303(2) vs Sec 21 BNS** | Section 379 vs Sec 95 IPC | Community Service / up to 3 years; **Section 21 bars liability for trivialities (*De Minimis*)** |
| **Voluntarily Causing Hurt** | **Section 115(2) BNS** | Section 323 IPC | Non-Cognizable, Bailable; up to 1 year jail or ₹1,000 fine |
| **Cheque Bounce** | **Section 138 NI Act** | Section 138 NI Act | Up to 2 years imprisonment or fine up to twice the cheque amount |
| **Cyber Harassment / Non-Consensual Images** | **Sec 66E / 67 IT Act & Sec 77 BNS** | Sec 354C IPC | Cognizable, Non-Bailable; up to 3-5 years imprisonment + fine |
| **Advocate Misconduct & Concession of Guilt** | **Bar Council Rules & Sec 35 Advocates Act** | Landmark *Himalayan Coop* Doctrine | Unauthorized confession of client guilt is professional misconduct; lawyer reprimanded |

---

### 4. Supreme Court Landmark Precedents Library
Accessible in `/legal-resources` and directly via LexBot:
- **Arnesh Kumar v. State of Bihar (2014)**: Safeguards against mechanical police arrest for offences carrying < 7 years jail; Section 41A notice mandatory.
- **D.K. Basu v. State of West Bengal (1997)**: The 11 golden procedural rules protecting citizens against custodial violence and secret detention.
- **Justice K.S. Puttaswamy v. Union of India (2017)**: Declared the Right to Privacy an inalienable Fundamental Right under Article 21.
- **Vishaka v. State of Rajasthan (1997)**: Formulated the foundational workplace sexual harassment prevention guidelines (precursor to POSH Act 2013).
- **Kesavananda Bharati v. State of Kerala (1973)**: Formulated the inviolable Basic Structure Doctrine of the Indian Constitution.
- **Lalita Kumari v. Govt. of U.P. (2014)**: Mandatory registration of FIR under Section 154 CrPC (now Section 173 BNSS) in cognizable cases.
- **Satender Kumar Antil v. CBI (2022)**: Landmark categorization of offences for streamlined bail administration.

---

## 🏗️ Architecture & Technology Stack

```
                              ┌─────────────────────────────────────────┐
                              │           CLIENT / WEB BROWSER          │
                              │  React 18 + Vite + Tailwind + WebRTC   │
                              └────────────────────┬────────────────────┘
                                                   │
                         ┌─────────────────────────┴─────────────────────────┐
                         │                                                   │
                  HTTPS REST API                                    WebSocket (Socket.IO)
                         │                                                   │
                         ▼                                                   ▼
       ┌───────────────────────────────────┐               ┌───────────────────────────────────┐
       │     Core Express API Server       │               │      Real-Time Socket Gateway     │
       │           (Port 5000)             │◄─────────────►│        (Chat, Alerts, Banners)    │
       └─────────────────┬─────────────────┘               └───────────────────────────────────┘
                         │
                         ├───────────────────────────────────────────┐
                         ▼                                           ▼
       ┌───────────────────────────────────┐       ┌───────────────────────────────────┐
       │          MongoDB Atlas            │       │      LexBot Chatbot Engine        │
       │    (Users, Profiles, Cases,       │       │    Standalone Microservice        │
       │     Consultations, Audit Logs)    │       │           (Port 5001)             │
       └───────────────────────────────────┘       └───────────────────────────────────┘
```

### Technology Highlights:
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React, Date-fns, Recharts.
- **Backend API**: Node.js, Express, MongoDB with Mongoose, JWT (JSON Web Tokens), Bcrypt.js, Zod validation.
- **Real-Time Communication**: Socket.IO for bi-directional live notifications, case chat, and broadcast banners.
- **Video Conferencing**: Native WebRTC peer-to-peer audio/video streaming.
- **AI Microservice**: Standalone LexBot server (Port 5001) with statutory regex and natural language intent parser.

---

## 📁 Directory Layout

```
CapstoneFinal/
├── legalconnect/
│   ├── backend/
│   │   └── src/
│   │       ├── config/           # Database & environment configuration
│   │       ├── controllers/      # Route controllers (Auth, Cases, Advocates, Admin)
│   │       ├── middleware/       # JWT auth, RBAC guards, rate limiters, validation
│   │       ├── models/           # Mongoose schemas (User, ClientProfile, AdvocateProfile, Case, etc.)
│   │       ├── routes/           # Express REST endpoints
│   │       ├── services/         # Business logic & chatbot intelligence
│   │       ├── socket/           # Real-time Socket.IO room management
│   │       └── server.js         # Backend server entry point (Port 5000)
│   └── frontend/
│       └── src/
│           ├── components/       # Reusable UI widgets, ChatbotWidget, DevilsAdvocatePanel
│           ├── context/          # AuthContext, PlatformContext, ToastContext, ThemeContext
│           ├── data/             # Landmark Supreme Court judgments & statutory datasets
│           ├── hooks/            # useAuth, useSocket, useNotifications, useChat, useVideoCall
│           ├── layouts/          # DashboardLayout (Role-aware sidebar), PublicLayout
│           ├── pages/            # Public, Client, Advocate, and Admin portal views
│           ├── routes/           # AppRoutes with lazy loading and role guards
│           └── services/         # API wrappers & client-side chatbot fallback engine
└── legalconnect-chatbot/
    ├── services/                 # Chatbot statutory engine (BNS 2023 vs IPC, Nyaya Kosh)
    └── server.js                 # Standalone Express microservice (Port 5001)
```

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/UJJWAL-7777/CapstoneFinal.git
cd CapstoneFinal
```

### 2. Configure Backend Server
```bash
cd legalconnect/backend
npm install

# Create .env file
cp .env.example .env
```
Ensure `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/legalconnect
JWT_SECRET=super_secret_jwt_key_legalconnect_2026
ADMIN_EMAIL=admin@legalconnect.local
ADMIN_PASSWORD=AdminPassword123!
```
Start backend:
```bash
npm run seed:admin   # Seeds initial admin user
npm run dev          # Starts API on http://localhost:5000
```

### 3. Configure Standalone LexBot Server (Optional / Microservice)
```bash
# In a new terminal
cd legalconnect-chatbot
npm install
npm run dev          # Starts LexBot on http://localhost:5001
```

### 4. Configure Frontend Application
```bash
# In a new terminal
cd legalconnect/frontend
npm install
npm run dev          # Starts Vite dev server on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Accounts & Test Credentials

For quick local or production testing on [LegalConnect](https://capstone-final-gamma.vercel.app/login), you can log in directly using the demo credentials below:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Client** | `client@legalconnect.local` | `ClientPassword123!` | Discovery, Consultations, Video Calls, Case Vault, Notice Generator |
| **Advocate** | `advocate@legalconnect.local` | `AdvocatePassword123!` | Practice CRM, Availability Calendar, Hearings, Case Workspace, Earnings |
| **Admin** | `admin@legalconnect.local` | `AdminPassword123!` | Verification Queue, User Management, System Maintenance, Platform Analytics |

*(You can also register a new client or advocate account directly from the `/register` page).*

---

## 📡 API & Socket.IO Architecture

### Core REST Endpoints

| Category | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register Client or Advocate | Public |
| **Auth** | `POST` | `/api/auth/login` | JWT Login & Session Retrieval | Public |
| **Advocates** | `GET` | `/api/advocates` | Debounced Advocate Search & Filters | Public |
| **Consultations** | `POST` | `/api/consultations` | Book Consultation Slot | Client |
| **Cases** | `GET` | `/api/cases` | List Active User Cases | Authenticated |
| **Messages** | `GET` | `/api/messages` | Fetch Case Chat History | Authenticated |
| **Admin** | `PATCH` | `/api/admin/advocates/:id/verification` | Approve/Reject Advocate Bar Credentials | Admin |
| **Platform** | `GET` | `/api/platform/status` | Maintenance Mode & Announcement Status | Public |
| **Chatbot** | `POST` | `/api/chat` | Standalone LexBot AI Statutory Query | Public |

### Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `chat:join` | Client → Server | `{ caseId }` | Joins private case room |
| `chat:message` | Bidirectional | `{ message, sender, caseId }` | Real-time case chat message |
| `notification:new` | Server → Client | `{ title, message, type }` | Real-time push notification |
| `platform:status:updated` | Server → Client | `{ maintenanceMode, announcementBanner }` | Broadcasts maintenance or announcement change |

---

## ⚡ Performance & Engineering Highlights

1. **0-Re-render GPU Toast System**:
   - Replaced continuous 60fps `requestAnimationFrame` state updates with hardware-accelerated CSS keyframe animations (`@keyframes toastProgress`).
   - Completely eliminates hundreds of React re-renders while toasts are active.
2. **WebSocket Connection Pooling**:
   - Implemented a singleton reference-counted `useSocket` hook. Components share a single persistent WebSocket connection rather than opening duplicate sockets.
3. **Smart State Guarding Against Polling Thrash**:
   - `PlatformContext` inspects incoming status snapshots and preserves object references (`prev === prev`) when values remain unchanged, preventing app-wide background re-renders.
4. **Debounced Search Inputs**:
   - 250ms debounce prevents API flooding while typing in advocate discovery.
5. **Code Splitting & Lazy Loading**:
   - 100% of routes are dynamically imported via `React.lazy()` and `Suspense`, keeping initial bundle weight minimal.

---

## ⚖️ Legal Disclaimer & Capstone Credits

> **Disclaimer**: LegalConnect and LexBot are developed as an academic capstone demonstration of legal-tech engineering. While LexBot draws upon statutory texts of the Bharatiya Nyaya Sanhita (BNS 2023) and landmark Supreme Court of India precedents, outputs generated by AI are for educational and informational purposes only and do not constitute formal legal counsel. Users should consult a Bar Council verified advocate for actionable legal representation.

**Project:** B.Tech / MCA Capstone Project  
**Repository:** [UJJWAL-7777/CapstoneFinal](https://github.com/UJJWAL-7777/CapstoneFinal)  
**Live Application:** [https://capstone-final-gamma.vercel.app](https://capstone-final-gamma.vercel.app)
