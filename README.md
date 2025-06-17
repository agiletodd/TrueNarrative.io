# 🧰 Stack

- Vite + React + Tailwind CSS
- Express.js
- Prisma + SQLite (local) / PostgreSQL (prod)
- JWT-based Authentication (no external auth providers)

# 🧱 Prerequisites

- Node.js v18+ (tested on v22)
- SQLite (no setup required)
- Optional: PostgreSQL for production environments

## 🚀 Getting Started

npm install
npx prisma generate --schema=backend/prisma/schema.prisma
npm run migrate
npm run dev

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:4000/api/feedback](http://localhost:4000/api/feedback)

## ⚙️ Environment Setup

Create a .env file in /backend:

- DATABASE_URL="file:./dev.db"
- JWT_SECRET="your-secret-key"

Or if using PostgreSQL in production:

- DATABASE_URL="postgresql://user:password@host:port/dbname"
- JWT_SECRET="your-secret-key"

# 📁 Source Structure

/backend
├── /src
│ ├── /routes # API endpoints
│ ├── /controllers # Business logic
│ ├── /services # Reusable backend modules
│ ├── /middleware # Auth, logging, error handlers
│ └── index.js # Express app entry
├── /prisma
│ ├── schema.prisma # Prisma schema
│ ├── migrations/ # Prisma DB migrations
│ └── seed.js # Optional seed data

/frontend
├── /src
│ ├── /components # Reusable UI components
│ ├── /pages # Route-level views
│ ├── /hooks # Custom React hooks
│ └── main.jsx # React app entry
├── index.html
└── vite.config.js # Vite config

.gitignore
.env # Contains DATABASE_URL
README.md
package.json # Root-level scripts (dev, build, etc.)
