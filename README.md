<div align="center">
  <img src="client/public/favicon.ico" alt="SyntaxGuard Logo" width="80" height="80">

  # SyntaxGuard
  
  **Your AI code reviewer that never sleeps.**
  
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
  [![Redis](https://img.shields.io/badge/Redis-Caching-red.svg)](https://redis.io/)
  [![Groq](https://img.shields.io/badge/AI-Groq_LLaMA_3.3-orange.svg)](https://groq.com/)
</div>

<br />

SyntaxGuard is a full-stack, AI-powered Code Review SaaS. It acts as an automated engineering partner that spots security vulnerabilities, logic bugs, and bad practices that static analysis tools miss. It integrates directly into your GitHub workflow to automatically review Pull Requests in seconds.

## ✨ Features

- **⚡ Blazing Fast AI Inference:** Powered by Groq's LLaMA 3.3 70B model, delivering comprehensive code analysis and actionable fixes in under 3 seconds.
- **🐙 GitHub Native Integration:** Install the GitHub App once, and SyntaxGuard automatically reviews every Pull Request, posting inline comments with severity tags and suggested code fixes directly on GitHub.
- **🛡️ Comprehensive Security Audits:** Detects SQL injection, XSS, exposed secrets, quadratic time complexity loops, and more.
- **💾 Smart Redis Caching:** Webhooks process cryptographic hashes of code diffs. Identical code is served from cache instantly, drastically reducing API costs and latency.
- **🌊 Real-time Streaming:** The manual web editor uses Server-Sent Events (SSE) to stream the AI's thought process and review results in real-time.
- **📊 Code Quality Dashboard:** Track your projects' health over time with visual trends, historical analysis logs, and comprehensive project management.

---

## 🏗️ Architecture

SyntaxGuard is built with a modern, highly scalable architecture designed to handle asynchronous webhooks and real-time streaming.

- **Frontend:** React (Vite), Redux Toolkit, React Router, Monaco Editor, Recharts.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose) for users, projects, and review history.
- **Caching:** Redis for caching AI responses and rate limiting.
- **AI Engine:** Groq SDK (LLaMA 3.3 70B).
- **Authentication:** JWT (JSON Web Tokens) with HTTP-only cookies.

### GitHub Webhook Flow
1. Developer opens or updates a Pull Request on GitHub.
2. GitHub sends a POST webhook to SyntaxGuard.
3. SyntaxGuard verifies the `x-hub-signature-256` payload to ensure authenticity.
4. SyntaxGuard responds `200 OK` instantly to prevent GitHub timeouts.
5. In the background, it fetches the PR diff, hashes it, and checks the Redis cache.
6. On a cache miss, the diff is sent to Groq AI for analysis.
7. SyntaxGuard posts the AI's review as inline comments on the exact lines of code in the GitHub PR.

---

## 🚀 Getting Started

Follow these steps to run SyntaxGuard locally.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI
- Redis server running locally (port 6379)
- [Groq API Key](https://console.groq.com/)
- [GitHub App](https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app/creating-a-github-app) (for webhook integration)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/SyntaxGuard.git
cd SyntaxGuard
```

### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Database & Cache
MONGODB_URI=mongodb://127.0.0.1:27017/syntaxguard
REDIS_URL=redis://127.0.0.1:6379

# Security
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# AI
GROQ_API_KEY=your_groq_api_key

# GitHub App Integration
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GITHUB_APP_NAME=your-github-app-name
```

Start the frontend development server:
```bash
npm run dev
```

Navigate to `http://localhost:5173` to see the application running.

---

## 📸 Screenshots

*(Add screenshots of your application here before publishing to your portfolio)*

- **Landing Page:** 
- **Dashboard:** 
- **Live Code Editor:** 
- **GitHub PR Review Example:** 

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/yourusername/SyntaxGuard/issues).

## 📝 License

This project is licensed under the MIT License.
