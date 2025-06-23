# 🎓 Welcome to TrueNarrative.io

This is a full-stack web app built with modern tools. We’ve made it super easy for you to run it locally with just a few steps — no advanced setup needed.

---

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

### 1. Download the Code

Open your terminal and run:

```bash
git clone https://github.com/YOUR_USERNAME/TrueNarrative.io.git
cd TrueNarrative.io
```

Or just download the ZIP and open the folder in your editor.

From here [https://github.com/agiletodd/TrueNarrative.io](https://github.com/agiletodd/TrueNarrative.io) click on the 'Code' button and select 'Download ZIP' from the drop down.

---

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

### 4. Set Up the Database

From the root folder, run:

```bash
npm run db:setup
```

This will:

- Create the local SQLite database
- Set up all the necessary tables
- Get the backend ready

---

### 5. Start the App

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

## 🛠 Need Help?

If you get stuck, ask a teammate or instructor. We're here to help!
