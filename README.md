# 🚀 CollabFlow — Premium Team Task Manager

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="ExpressJS" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Netlify" />
</div>

---

### 🌟 Introduction
**CollabFlow** is a premium, feature-rich, full-stack **Team Task Manager** application designed to deliver an elevated project orchestration experience. Built with a luxurious **dark glassmorphic user interface**, stable real-time synchronization, and a bulletproof, crash-resistant architecture, CollabFlow redefines collaborative productivity.

It features an interactive drag-and-drop Kanban board, a robust Admin Analytics panel, role-based access control, automatic database seeding, and graceful offline/online fallback features.

---

## 💎 Key Elevated Features

### ⚡ 1. Real-time Live Sync (WebSockets)
* Powered by **Socket.io** with localized workspace rooms segmented by `projectId`.
* Moving a task card on the Kanban board or modifying priority instantly propagates to all other connected teammates in real-time, eliminating manual page reloads.

### 📊 2. Premium Admin Analytics Console
* Available exclusively to **Admins** on their main dashboard.
* **Completion Velocity Meter:** Interactive SVG-based gauge showing real-time task completion ratios.
* **Resource Allocation Index:** Visualized chart detailing workload distribution across active team members.
* **Project Portfolio Audit:** Interactive table tracking staffing loads, completion percentages, and dynamic health tags.

### 🖼️ 3. Safe Avatar Uploads & Offline Fallback
* Full user profile customizer with live avatar uploads powered by **Multer** and **Cloudinary**.
* **Zero-Config Local Fallback:** If Cloudinary keys are omitted in development, the backend automatically converts image uploads to **Base64 Data URIs** and stores them in MongoDB. Uploads work flawlessly out of the box!

### 🛡️ 4. Crash-Proof React Architecture
* **Location-Aware Error Boundary:** Wrapped inside `DashboardLayout` using the active route path as a dynamic key. If a specific page encounters a parsing error, the Sidebar and Navbar remain fully functional. Simply navigating to another tab instantly unmounts the crashed state and resets the UI!
* **Safe Date Utility:** All date parsing processes are wrapped in a robust helper utility that detects invalid date formats and returns elegant placeholders (e.g. `"No date"`) instead of triggering raw JS `RangeError` virtual DOM crashes.

### 🎨 5. Overlap-Free Premium Aesthetics
* Input fields inside `Login.jsx` and `Signup.jsx` feature custom left-padding CSS overrides that prevent Lucide icons from overlapping text across all viewport resolutions.

---

## 🏗️ Folder Structure

```text
📂 CollabFlow (Workspace Root)
├── 📂 backend
│   ├── 📂 src
│   │   ├── 📂 config          # DB connection and helper configs
│   │   ├── 📂 controllers     # Route controllers (Auth, Project, Task, Users, Dashboard)
│   │   ├── 📂 middleware      # Auth, Role checks, Multer upload, Central Error Handler
│   │   ├── 📂 models          # Mongoose Schemas (User, Project, Task)
│   │   ├── 📂 routes          # Express API route definitions
│   │   ├── 📂 utils           # SMTP Mail and date formatting utilities
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Socket.io wrapper & Server bootloader
│   ├── package.json
│   ├── .env.example
│   └── .env
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 components      # Common UI elements and Layout (Sidebar, Navbar, ErrorBoundary)
│   │   ├── 📂 context         # Auth, Socket, Theme, and Toast Context Providers
│   │   ├── 📂 pages           # Dashboard, Projects, Kanban Board, Tasks, Profile
│   │   ├── 📂 services        # Axios API client wrapper
│   │   ├── 📂 utils           # Crash-proof Date formatting utility
│   │   ├── App.jsx            # Router & Context configurations
│   │   ├── index.css          # Tailwind configurations & direct input overrides
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── package.json               # Root Orchestrator script runner
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, React Router v6, Axios, Lucide Icons, Socket.io-client |
| **Backend** | Node.js, Express.js, Socket.io, Multer, Cloudinary SDK, Nodemailer |
| **Database** | MongoDB with Mongoose ORM |
| **Security** | JWT (JSON Web Tokens), `bcryptjs` password hashing |
| **Deployment** | Split Serverless Architecture (Frontend on Netlify, Backend on Vercel, Database on MongoDB Atlas) |

---

## 🛡️ Role-Based Access Controls (RBAC)

CollabFlow enforces strict, role-based authorization to protect workspace integrity:

| Feature Permission | 👑 Project Admin | 🧑 Workspace Member |
| :--- | :---: | :---: |
| Create New Projects | ✅ Yes | ❌ No |
| Delete Projects & Scope | ✅ Yes | ❌ No |
| Invite / Remove Members | ✅ Yes | ❌ No |
| Create & Allocate Tasks | ✅ Yes | ❌ No |
| Edit Task Details & Priority | ✅ Yes | ❌ No |
| Delete Tasks | ✅ Yes | ❌ No |
| Move Kanban Cards (Status) | ✅ Yes | ✅ Yes (Assigned tasks) |

---

## 🚀 Local Quickstart Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* A running [MongoDB](https://www.mongodb.com/) database (local instance or MongoDB Atlas)

### 2. Installation
Clone your repository and run the orchestrator install script from the root workspace directory:
```bash
npm run install-all
```
This automatically installs all package dependencies for both the `backend` and `frontend` folders.

### 3. Environment Variables
Create a file named `.env` inside the `/backend` directory. Here is a pre-configured template:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=collabflow_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Cloudinary Settings (Optional - falls back to Base64 buffers if empty)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Settings (Optional - falls back to CLI logging if empty)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@collabflow.com
```

### 4. Seed the Database
Populate your database with complete sample data (users, projects, task distributions):
```bash
npm run seed
```

> 🔑 **Pre-Seeded Accounts:**
> * 👑 **Admin:** `admin@example.com` / `password123`
> * 🧑 **Member:** `member@example.com` / `password123`

### 5. Running the Application
Open two separate terminal windows in your project root:

* **Terminal A (Start Backend API):**
  ```bash
  npm run dev-backend
  ```
* **Terminal B (Start Frontend Dev Server):**
  ```bash
  npm run dev-frontend
  ```

Open your browser and navigate to `http://localhost:5173`!

---

## 🌐 Production Cloud Deployment (Vercel + Netlify Split Serverless)

CollabFlow is production-ready and optimized for a zero-cost, high-performance **Split Cloud Architecture**:
* **Frontend:** Hosted globally on **Netlify** for blistering fast CDN delivery.
* **Backend:** Hosted on **Vercel** as a secure, auto-scaling Serverless API.
* **Database:** Hosted on **MongoDB Atlas** for reliable, secure cloud storage.

### ⚙️ Backend Deployment (Vercel)
1. Import the `backend` subfolder to Vercel as an **Express** project preset.
2. In Vercel's **Environment Variables**, configure:
   * `NODE_ENV` = `development` (Tells Express to operate in serverless API mode)
   * `MONGODB_URI` = *Your MongoDB Atlas connection link*
   * `JWT_SECRET` = *Your secure JWT signature secret*
   * `JWT_EXPIRES_IN` = `7d`
3. Click **Deploy**. Vercel will output your secure API domain (e.g. `https://your-app-backend.vercel.app`).

### 💻 Frontend Deployment (Netlify)
1. Import the `frontend` subfolder to Netlify.
2. In the Netlify **Build settings**, configure:
   * **Base directory:** `frontend`
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
3. In Netlify's **Environment Variables**, connect the frontend to your Vercel backend:
   * `VITE_API_URL` = `https://your-app-backend.vercel.app/api`
   * `VITE_SOCKET_URL` = `https://your-app-backend.vercel.app`
4. Click **Deploy**. Your premium application is live!

---

## 📖 API Reference Index

### 🔐 Authentication (`/api/auth`)
* `POST /signup` - Register a new user (`name`, `email`, `password`, `role`).
* `POST /login` - Log in and obtain JWT access token.
* `GET /me` - Get current authenticated user profile.

### 📁 Projects (`/api/projects`)
* `POST /` - Create a new project (Admin only).
* `GET /` - List all projects active for the authenticated user.
* `GET /:id` - Retrieve specific project details.
* `PUT /:id` - Update project metadata (Project Admin only).
* `DELETE /:id` - Delete project (Project Admin only).
* `POST /:id/members` - Add member to project by email (Project Admin only).
* `DELETE /:id/members/:userId` - Remove member from project (Project Admin only).

### 📋 Tasks (`/api/tasks`)
* `POST /` - Allocate a new task (Admin only).
* `GET /project/:projectId` - Fetch tasks for a project room.
* `PUT /:id` - Edit task details, assignees, or priority (Admin only).
* `DELETE /:id` - Remove a task (Admin only).
* `PATCH /:id/status` - Move task status (`Pending`, `In Progress`, `Completed`).

### 👤 Profile & Uploads (`/api/users`)
* `GET /` - Fetch all workspace users (Admin only).
* `PUT /profile` - Update profile name and email coordinates.
* `PUT /avatar` - Upload profile picture (accepts image files; uploads to Cloudinary or falls back to Mongoose).

### 📈 Workspace Analytics (`/api/dashboard`)
* `GET /stats` - Aggregated status counts and developer allocations (Admin only).

---

<div align="center">
  <sub>Managed and Maintained by <b>EtharaAI</b></sub>
</div>