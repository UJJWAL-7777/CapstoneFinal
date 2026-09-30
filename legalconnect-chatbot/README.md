# LexBot — LegalConnect AI Chatbot

A standalone chatbot microservice for the LegalConnect platform. Runs independently and can be deployed separately.

## Features

- 🤖 **Smart Intent Detection** — Greetings, legal queries, platform navigation, FAQs, complaints
- ⚖️ **12 Legal Practice Areas** — Family, Property, Criminal, Corporate, Civil, Labour, Consumer, Tax, IP, Cyber, Banking, Immigration
- 🎯 **Role-Aware Responses** — Different help for Clients, Advocates, and Admins
- 📚 **9 Built-in FAQs** — Booking, cases, payments, documents, video calls, security, etc.
- 🚀 **Zero External Dependencies** — No external AI APIs needed, works 100% offline
- 🔗 **REST API** — Simple POST endpoint, easy to integrate

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Start production server
npm start
```

Server starts on **port 5001** (configurable via `CHATBOT_PORT` env variable).

## API Reference

### Health Check
```
GET /api/health
```

Response:
```json
{
  "success": true,
  "service": "LexBot Chatbot",
  "version": "1.0.0",
  "status": "online"
}
```

### Chat
```
POST /api/chat
Content-Type: application/json
```

Request body:
```json
{
  "message": "Hello",
  "userRole": "client",    // "client" | "advocate" | "admin" (optional, defaults to "client")
  "userName": "Rahul"      // optional, defaults to "User"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "response": "Hello Rahul! 👋 I'm LexBot, your LegalConnect assistant...",
    "suggestions": ["Book a consultation", "Track my case", "Find an advocate"],
    "type": "text",
    "intent": "greeting",
    "timestamp": "2026-09-30T06:36:06.966Z"
  }
}
```

## Integration with LegalConnect Frontend

The main LegalConnect frontend includes a `ChatbotWidget.jsx` component that calls this API. The widget:

1. Shows a floating chat button (bottom-right) after user login
2. Sends `{ message, userRole, userName }` to `http://localhost:5001/api/chat`
3. Displays the bot response with markdown formatting
4. Shows clickable suggestion chips

To change the chatbot URL in production, update the `CHATBOT_API` constant in:
```
legalconnect/frontend/src/components/ChatbotWidget.jsx
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHATBOT_PORT` | `5001` | Server port |
| `CORS_ORIGIN` | — | Production frontend URL for CORS |

## Deployment

This is a standard Node.js Express app. Deploy to any platform:

```bash
# Docker
docker build -t lexbot .
docker run -p 5001:5001 lexbot

# Railway / Render / Fly.io
# Just connect the repo and set the start command to: npm start
```

## Project Structure

```
legalconnect-chatbot/
├── server.js                    # Express server + API routes
├── services/
│   └── chatbot.service.js       # Intelligence engine (intents, legal KB, FAQs)
├── package.json
└── README.md
```
