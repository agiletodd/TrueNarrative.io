# 🎓 Welcome to TrueNarrative.io

Welcome to the TrueNarrative.io project — a modern full-stack web app built to help you learn by building. You'll be contributing real features using the same tools used in today’s production environments.

> ⚠️ **Important:** This README is the official pre-class setup guide. Follow each step carefully **before the first session** to make sure everything runs smoothly.

## 🌟 Why TrueNarrative?

TrueNarrative is more than just an app — it’s a platform for capturing ideas, shaping feedback, and empowering people to be heard. Our mission is to give users a simple, delightful way to share what matters and help great products improve through honest, thoughtful input.

As a student, you're not just learning to code — you're helping shape a tool that makes feedback feel human again.

## 🛠 What's Inside

- 🗾 Frontend: Vite + React + Tailwind CSS
- 🔧 Backend: Express.js + Prisma
- 📀 Database: SQLite (local) / PostgreSQL (production)
- 🔐 Authentication: Basic email/password (no Google/Facebook login)

---

## ✅ What You Need First

Install these tools before starting:

- [Node.js (v18 or newer)](https://nodejs.org/en) — Required to run the app
- Code editor (we recommend [Visual Studio Code](https://code.visualstudio.com/))

You **do not** need to install a database — SQLite works out of the box.

---

## 🚀 Get Started in 5 Steps

### 1. Fork the Repo

Go to https://github.com/agiletodd/TrueNarrative.io and click the Fork button in the top-right to create your own copy of the project.

Then clone your fork by running:

```bash
git clone https://github.com/YOUR_USERNAME/TrueNarrative.io.git
cd TrueNarrative.io
```

📝 Do not clone the original repo directly. You'll be working from your own fork.

### 2. Install All Dependencies

Run this from the root folder:

```bash
npm install
```

---

### 3. Create Local Settings Files

You’ll need to add a few `.env` files so the app knows how to run:

#### 📂 Backend: `backend/.env`

Create a file named `.env` inside the `backend` folder and paste this:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

#### 📂 Frontend: `frontend/.env`

Create a file named `.env` inside the `frontend` folder and paste this:

```
VITE_API_URL=http://localhost:4000
```

---

### 4. Start the App

Run this from the root folder:

```bash
npm run dev
```

That’s it! Now open:

- 🗾 Frontend: [http://localhost:5173](http://localhost:5173)
- 🔌 Backend API: [http://localhost:4000/health](http://localhost:4000/health)

---

## 📁 Project Structure

```
/backend
  ├── src/            # All backend code
  ├── prisma/         # Database config (Prisma)
  └── server.js       # Backend entry point

/frontend
  ├── src/            # All frontend code
  └── main.jsx        # Frontend entry point
```

---

## ✅ Pre-Class Checklist

Before class starts, make sure you've:

- [ ] Forked the repo to your GitHub account
- [ ] Cloned your fork locally
- [ ] Installed Node.js and dependencies with npm install
- [ ] Created both .env files
- [ ] Set up the database with npm run db:setup
- [ ] Verified the app runs using npm run dev
- [ ] Visited http://localhost:5173 in your browser

🛠 Need Help?

If you get stuck, ask a teammate or instructor. We're here to help!
