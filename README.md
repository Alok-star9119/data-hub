# 🧠 The Data Hub — REST API Engineering & Testing Studio

<div align="center">

### Build • Test • Inspect • Understand REST APIs

A full-stack developer workspace for learning and demonstrating **Node.js, Express, RESTful CRUD, in-memory data handling, custom middleware, mock JWT authentication, API testing, and server observability**.

<br />

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![REST API](https://img.shields.io/badge/API-RESTful-FF6F00)
![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-Apache--2.0-green)

**Built with ❤️ by Alok Kumar Mishra**

</div>

---

## 🌟 Overview

**The Data Hub** is an interactive REST API engineering and testing studio.

Instead of building a backend and testing it in a separate tool, the project combines the **REST API server, database explorer, request console, automated QA suite, API documentation, and server logs** into one developer-focused interface.

The project demonstrates a complete learning-oriented backend workflow:

```text
React UI
   │
   ├── Thunder Client
   │       │
   │       ▼
   │    REST API
   │       │
   │       ├── GET
   │       ├── POST
   │       ├── PUT
   │       └── DELETE
   │
   ├── Database Explorer
   │
   ├── Server Console
   │
   └── API Documentation
            │
            ▼
      Express Backend
            │
            ▼
      In-Memory Database
```

---

# ✨ Features

## ⚡ Interactive Thunder Client

Send API requests directly from the application without opening an external API client.

Supported operations:

- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/login`

The interface displays:

- HTTP status
- Response time
- Response size
- Response headers
- Pretty JSON
- Raw response
- Authentication token
- Request body

---

## 🗄️ In-Memory Database Explorer

The project intentionally uses an in-memory array to demonstrate CRUD fundamentals without requiring MongoDB, PostgreSQL, MySQL, or another database.

```ts
let blogPosts: BlogPost[] = [];
```

The database explorer lets you:

- View records
- Refresh records
- Seed demo records
- Reset the database
- Delete records
- Open records in the API testing workspace

> **Important:** Because the database is in memory, data is not permanent. Restarting the server or moving between serverless instances can reset the records.

---

# 🔄 RESTful CRUD Architecture

The API follows standard REST conventions.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/posts` | Get all posts |
| `GET` | `/api/posts/:id` | Get one post |
| `POST` | `/api/posts` | Create a post |
| `PUT` | `/api/posts/:id` | Update a post |
| `DELETE` | `/api/posts/:id` | Delete a post |
| `POST` | `/api/login` | Generate mock JWT |

---

# 🧪 Automated QA Test Suite

The built-in QA runner executes a complete API workflow:

```text
1. GET all posts
       ↓
2. POST create post
       ↓
3. GET created post
       ↓
4. PUT update post
       ↓
5. DELETE post
       ↓
6. GET deleted post → 404
       ↓
7. POST login → JWT
```

Each step records:

- Expected status
- Actual status
- Execution time
- Response payload
- Pass/Fail result

This makes the application useful as a demonstration of **integration testing and API validation**.

---

# 🔐 Mock JWT Authentication

The project includes a demonstration authentication endpoint:

```http
POST /api/login
```

Example:

```json
{
  "username": "developer@thedatahub.io",
  "password": "securepassword123"
}
```

Example response:

```json
{
  "message": "Login successful. Mock JWT generated.",
  "token": "HEADER.PAYLOAD.SIGNATURE",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

### ⚠️ Security Notice

This is a **mock authentication implementation for educational/demo purposes**.

It is **not production authentication**.

The generated token is not cryptographically verified and should not be used to protect real user accounts or sensitive resources.

---

# 🖥️ Server Console

The custom middleware captures HTTP activity in the format:

```text
[GET] /api/posts - 10:05 AM
[POST] /api/posts - 10:06 AM
[PUT] /api/posts/1 - 10:07 AM
[DELETE] /api/posts/1 - 10:08 AM
```

The console also records:

- HTTP method
- Path
- Timestamp
- Status code
- Request duration

The latest 150 API-related events are retained in memory.

---

# 📚 API Documentation Center

The **API Docs** section provides:

- REST endpoint reference
- Phase-based architecture overview
- cURL examples
- Postman collection export
- Copy-to-clipboard commands
- CRUD documentation

The Postman collection uses a configurable `{{baseUrl}}` variable so the same collection can be adapted to local or deployed environments.

---

# 📡 Diagnostic Endpoints

The backend also provides developer utilities.

### Server Status

```http
GET /api/status
```

Returns:

- Server status
- Active port
- Record count
- Middleware status
- Authentication status
- Uptime
- Timestamp

### Server Logs

```http
GET /api/logs
```

### Clear Logs

```http
DELETE /api/logs
```

### Seed Database

```http
POST /api/seed
```

### Reset Database

```http
POST /api/reset
```

---

# 🏗️ Architecture

```text
                         THE DATA HUB
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        React Frontend                    Express API
             │                                 │
     ┌───────┼────────┐                ┌───────┼────────┐
     │       │        │                │       │        │
 Thunder   Database  Docs           CRUD    Auth    Middleware
 Client    Explorer                   │       │        │
     │       │        │                └───────┼────────┘
     └───────┴────────┘                        │
             │                                 ▼
             │                         In-Memory Store
             │                         blogPosts[]
             │
             └──────────── API Requests ────────────┘
```

---

# 📂 Project Structure

```text
the-data-hub/
│
├── api/
│   └── [...path].ts          # Vercel serverless API entry point
│
├── server/
│   └── app.ts                # Shared Express application
│
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ThunderClient.tsx
│   │   ├── DatabaseExplorer.tsx
│   │   ├── ServerConsole.tsx
│   │   └── ApiDocs.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
│
├── server.ts                  # Local development server
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React** | Frontend UI |
| **TypeScript** | Type-safe development |
| **Vite** | Frontend tooling |
| **Tailwind CSS** | Interface styling |
| **Express.js** | REST API |
| **Node.js** | Backend runtime |
| **Lucide React** | Icons |
| **Motion** | UI interactions/animation |
| **Vercel Functions** | Production API deployment |

---

# 🚀 Getting Started

## 1️⃣ Clone

```bash
git clone https://github.com/yourusername/the-data-hub.git
```

## 2️⃣ Enter the directory

```bash
cd the-data-hub
```

## 3️⃣ Install dependencies

```bash
npm install
```

## 4️⃣ Start locally

```bash
npm run dev
```

The local application starts through the Express/Vite development server.

---

# 🧪 Build the Frontend

```bash
npm run build
```

The production frontend is generated inside:

```text
dist/
```

---

# 🔍 Type Check

```bash
npm run lint
```

---

# ☁️ Vercel Deployment

The project has been structured so that the **frontend and API can be deployed together on Vercel**.

### Vercel architecture

```text
                    Vercel
                      │
          ┌───────────┴───────────┐
          │                       │
       Vite UI                API Function
          │                       │
          │                 api/[...path].ts
          │                       │
          └───────────┬───────────┘
                      │
                 Express App
                      │
                In-Memory Data
```

### Deployment steps

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Keep the framework as **Vite**.
4. Use the default build command:

```bash
npm run build
```

5. Deploy.

The API is exposed through:

```text
/api/posts
/api/login
/api/status
/api/logs
/api/seed
/api/reset
```

---

# 🧩 Why the Vercel Version Is Different

A normal local Express application can listen on:

```text
localhost:3000
localhost:5000
```

A Vercel deployment should not depend on manually binding Express to ports.

The deployment version therefore separates:

```text
server/app.ts
```

from:

```text
server.ts
```

`server/app.ts` contains the reusable Express application.

`server.ts` is responsible for local development.

```text
Local
server.ts
   ↓
Express App
   ↓
Vite Middleware
   ↓
localhost:3000


Vercel
api/[...path].ts
   ↓
Express App
   ↓
Vercel Function
```

This separation makes the backend reusable across both environments.

---

# ⚠️ Data Persistence

This project intentionally uses:

```ts
let blogPosts: BlogPost[] = [];
```

Therefore it is **not a persistent database**.

On Vercel, serverless functions may run in different instances. You should not rely on the in-memory array for permanent data storage.

### For a production version, consider:

- MongoDB
- PostgreSQL
- Supabase
- Firebase
- Neon
- PlanetScale
- Redis

---

# 🔮 Future Roadmap

## Phase 4 — Real Database

- [ ] MongoDB integration
- [ ] PostgreSQL support
- [ ] Persistent records
- [ ] Database migrations

## Phase 5 — Real Authentication

- [ ] Password hashing
- [ ] JWT verification
- [ ] Refresh tokens
- [ ] Role-based access control
- [ ] Session management

## Phase 6 — Production API

- [ ] Request rate limiting
- [ ] API versioning
- [ ] OpenAPI/Swagger
- [ ] Centralized error handling
- [ ] Structured logging
- [ ] Automated API tests

## Phase 7 — Cloud Engineering

- [ ] Docker
- [ ] CI/CD
- [ ] Cloud database
- [ ] Monitoring
- [ ] Metrics dashboard

---

# 🎓 What This Project Demonstrates

This project demonstrates practical understanding of:

- REST architecture
- HTTP methods
- Express.js
- Node.js
- React
- TypeScript
- CRUD operations
- Middleware
- Request logging
- In-memory data structures
- Authentication concepts
- JWT structure
- API testing
- Integration testing
- Error handling
- Serverless deployment
- Vercel architecture
- Frontend/backend separation

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/new-feature
```

Make your changes and then:

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

Open a Pull Request on GitHub.

---

# 📄 License

This project is distributed under the **Apache License 2.0**.

---

# 👨‍💻 Author

## Alok Kumar Mishra

Computer Science & Data Analytics student and developer interested in:

`Web Development` • `React` • `TypeScript` • `Node.js` • `REST APIs` • `AI/ML` • `Data Analytics`

---

<div align="center">

### 🧠 Build APIs. Test APIs. Understand APIs.

**The Data Hub — REST API Engineering & Testing Studio**

Made with ❤️ by **Alok Kumar Mishra**

⭐ If this project helped you, consider starring the repository.

</div>
