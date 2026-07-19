# SyntaxGuard

> An AI-powered code review platform that automatically audits your Pull Requests and delivers detailed, inline feedback directly on GitHub.

<div align="center">

[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Groq](https://img.shields.io/badge/Groq_LLaMA_3.3_70B-FF6D00?style=flat-square)](https://groq.com/)

</div>

---

## Overview

SyntaxGuard connects to your GitHub repositories and automatically reviews every Pull Request the moment one is opened. It identifies logic bugs, security vulnerabilities, performance issues, and bad coding practices — posting the findings as inline comments directly on the affected lines of code. It also provides a web interface where you can manually paste code for instant analysis.

---

## Architecture

```
                           ┌─────────────────────────────────────────────────────┐
                           │                      CLIENT                          │
                           │                                                       │
                           │   React + Redux     Monaco Editor     Recharts       │
                           │   (Auth, State)     (Code Input)     (Dashboard)     │
                           └────────────────────────┬────────────────────────────┘
                                                    │  REST API / SSE (Streaming)
                                                    ▼
┌────────────┐  Webhook   ┌─────────────────────────────────────────────────────┐
│            │  (PR open/ │                      SERVER                          │
│   GitHub   │ ─────────▶ │                                                       │
│            │ updated)   │   Express.js                                          │
│  GitHub    │            │                                                       │
│  App       │            │   ┌────────────┐   ┌────────────┐   ┌────────────┐  │
│            │            │   │   Auth     │   │  Webhook   │   │  Analysis  │  │
│  Inline PR │ ◀───────── │   │ Controller │   │ Controller │   │ Controller │  │
│  Comments  │  Post      │   └────────────┘   └─────┬──────┘   └─────┬──────┘  │
│  (Reviews) │  Review    │                          │                │          │
└────────────┘            │             ┌────────────┘                │          │
                           │             ▼                             ▼          │
                           │   ┌──────────────────┐       ┌──────────────────┐  │
                           │   │   Cache Check    │       │   Groq AI        │  │
                           │   │   (Redis)        │──────▶│   (LLaMA 3.3)    │  │
                           │   │                  │ miss  │                  │  │
                           │   │  Hash(diff) key  │       │  Streams JSON    │  │
                           │   └────────┬─────────┘       └─────────┬────────┘  │
                           │            │ hit                        │           │
                           └────────────┼────────────────────────────┼───────────┘
                                        │                            │
                                        ▼                            ▼
                           ┌─────────────────────────────────────────────────────┐
                           │                    DATA LAYER                        │
                           │                                                       │
                           │    MongoDB                        Redis               │
                           │    ├── users                      └── pr_diff:<hash> │
                           │    ├── analyses                       (TTL: 24h)      │
                           │    ├── repositories                                   │
                           │    ├── githubreviews                                  │
                           │    └── githubinstallations                            │
                           └─────────────────────────────────────────────────────┘
```

### GitHub Webhook Flow

When a developer opens or updates a Pull Request:

```
1. GitHub  ──▶  POST /api/webhooks/github
               (HMAC-SHA256 signature verified)
               Server responds 200 OK immediately

2. Background job starts:
   ├── Fetch PR diff from GitHub API
   ├── Filter out non-code files (images, lock files)
   ├── Hash the diff  ──▶  Check Redis cache
   │     ├── Cache hit   ──▶  Use cached result (instant)
   │     └── Cache miss  ──▶  Send to Groq AI ──▶  Save to cache
   ├── Format AI output into GitHub review comments
   ├── POST review to GitHub (inline comments on PR)
   └── Save review record to MongoDB (for dashboard)
```

---

## Features

- **Automated PR Reviews** — Install the GitHub App once. Every new Pull Request is reviewed automatically with no manual action required.
- **Inline Comments on GitHub** — Findings are posted as line-level comments with severity labels (critical, high, medium, low) and suggested code fixes.
- **Redis Caching** — Diffs are hashed and cached for 24 hours. Re-reviewing an identical diff costs zero API calls.
- **Real-time Streaming** — The web editor streams AI responses to the browser as they are generated using Server-Sent Events (SSE).
- **Code Quality Dashboard** — View historical analyses, track quality trends over time using charts, and manage multiple projects.
- **Security Audits** — Detects SQL injection, XSS vulnerabilities, hardcoded secrets, exposed API keys, and insecure patterns.

---

## Tech Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Frontend       | React 18, Vite, Redux Toolkit, React Router     |
| Code Editor    | Monaco Editor (VS Code's editor engine)         |
| Charts         | Recharts                                        |
| Backend        | Node.js, Express.js                             |
| Database       | MongoDB with Mongoose                           |
| Cache          | Redis                                           |
| AI Engine      | Groq SDK — LLaMA 3.3 70B                       |
| Authentication | JWT (JSON Web Tokens)                           |
| GitHub         | GitHub Apps API, Webhooks, Octokit              |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- Redis (local, port 6379)
- [Groq API Key](https://console.groq.com/)
- [GitHub App](https://docs.github.com/en/apps/creating-github-apps) (for webhook integration)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/SyntaxGuard.git
cd SyntaxGuard
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/syntaxguard
REDIS_URL=redis://127.0.0.1:6379

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

GROQ_API_KEY=your_groq_api_key

GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GITHUB_APP_NAME=your-github-app-name
```

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## License

MIT
