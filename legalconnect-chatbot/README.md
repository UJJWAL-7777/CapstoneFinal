# 🤖 LexBot — AI Legal Jurisprudence & Chatbot Microservice

A standalone, zero-external-dependency AI chatbot microservice for the LegalConnect platform. Operates independently on **port 5001** with zero API costs, full offline capability, and deep statutory knowledge of Indian law.

---

## 🌟 Key Capabilities

### 1. 🇮🇳 Trilingual "Nyaya Bhasha" Engine
- **Languages Supported**: **English**, **हिन्दी (Hindi)**, and **Hinglish**.
- **Vernacular Tone**: Context-aware legal vernacular adapted for ordinary citizens and professional advocates.

### 2. ⚖️ Bharatiya Nyaya Sanhita (BNS 2023) vs IPC Database
- **Robbery & House-Breaking**:
  - **Section 309(4) BNS** (Old IPC 392) — Robbery in dwelling house (up to 14 years rigorous imprisonment + fine).
  - **Section 331(6) & 332 BNS** (Old IPC 457/458) — House-breaking by night.
  - **Section 310 BNS** (Old IPC 395) — Dacoity (5+ persons) with Life Imprisonment.
  - **Section 41 BNS** (Old IPC 103) — Statutory Right of Private Defence extending to causing death to night home-invaders.
- **Homicide & Assault**:
  - **Section 103 BNS** (Old IPC 302) — Murder (Death penalty or Life Imprisonment).
  - **Section 109 BNS** (Old IPC 307) — Attempt to Murder.
  - **Section 115(2) BNS** (Old IPC 323) — Voluntarily causing hurt.
- **Intellectual Legal Doctrines**:
  - **Section 21 BNS** (Old IPC 95) — *De Minimis Non Curat Lex* (law does not take account of trifles).
  - **Advocate Misconduct** — Bar Council Rules & landmark *Himalayan Coop* doctrine against unauthorized concession of guilt.
- **Commercial & Cyber Offenses**:
  - **Section 138 NI Act** — Cheque bounce procedure and limitation periods.
  - **Section 66E / 67 IT Act & Section 77 BNS** — Non-consensual image sharing and privacy violations.

### 3. 🏛️ Supreme Court Landmark Precedents
Provides structured case briefs, ratio decidendi, and citation guidance for:
- *Arnesh Kumar v. State of Bihar* (Arrest safeguards under 7 years)
- *D.K. Basu v. State of West Bengal* (Custodial rights & arrest memo rules)
- *Justice K.S. Puttaswamy v. UOI* (Right to Privacy)
- *Vishaka v. State of Rajasthan* (Workplace sexual harassment / POSH)
- *Kesavananda Bharati v. State of Kerala* (Basic Structure Doctrine)

### 4. 📖 Nyaya Kosh (Legal Glossary)
Instant definitions for common legal terms (*Bail, Cognizable Offence, FIR, Vakalatnama, Injunction, Anticipatory Bail, Lok Adalat*).

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Start production server
npm start
```
Starts on **port 5001** (or `PORT` / `CHATBOT_PORT` from `.env`).

---

## 📡 API Reference

### 1. Health Check
```http
GET /api/health
```
Response:
```json
{
  "success": true,
  "service": "LexBot Chatbot",
  "version": "1.0.0",
  "status": "online",
  "timestamp": "2026-10-17T01:30:00.000Z"
}
```

### 2. Chat Query
```http
POST /api/chat
Content-Type: application/json
```
Request Body:
```json
{
  "message": "what is act applied if any one rob a house",
  "userRole": "client",
  "userName": "Rahul",
  "lang": "en"
}
```
Response:
```json
{
  "success": true,
  "data": {
    "response": "📚 **Applicable Statutory Sections & Jurisprudential Analysis:**\n*Topic: Robbing a House / House-Breaking & Burglary (BNS 2023 vs IPC)*\n...",
    "suggestions": ["Consult a specialist lawyer", "Explore Landmark Cases", "Open Legal Study Hub"],
    "type": "applied_sections",
    "intent": "applied_sections",
    "lang": "en",
    "timestamp": "2026-10-17T01:30:01.000Z"
  }
}
```

---

## 📁 Architecture

```
legalconnect-chatbot/
├── server.js                    # Express microservice, rate limiter, CORS & health check
├── services/
│   └── chatbot.service.js       # Statutory BNS 2023 engine, landmark cases, glossary
├── package.json
└── README.md
```
