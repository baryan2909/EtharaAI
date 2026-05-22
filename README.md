# CollabFlow 🚀 (Team Task Manager)

CollabFlow is a premium, feature-rich, full-stack **Team Task Manager** application (similar to an elevated Trello or Asana). It enables teams to orchestrate projects, manage tasks via an interactive drag-and-drop Kanban board, synchronize changes in real-time, track analytics in a comprehensive dashboard, and enforce roles (Admin vs. Member) securely with JWT authentication.

Designed with a premium modern glassmorphic interface, dynamic dark/light themes, custom SVG/CSS widgets, and rich animations.

---

## ✨ Key Elevated Features

1. **Real-time Live Sync (WebSockets):**
   * Powered by **Socket.io**.
   * Collaborative rooms segmented by `projectId`.
   * Dragging a task on the Kanban board or updating details instantly propagates status changes, creation, and deletion to all other connected teammates in real-time without requiring a page refresh.

2. **Premium Admin Analytics Console:**
   * Available exclusively to **Admin** users on their main Dashboard.
   * Features interactive CSS/SVG-based gauges showing workspace **Velocity**, completion ratios, and task distribution across *Pending*, *In Progress*, and *Completed* columns.
   * Includes a **Resource Allocation Index** detailing team member task workloads.
   * A full **Project Portfolio Audit Table** listing staffing, complete-vs-total task load, progress percentages, and project health statuses.

3. **User Profile & Avatar Upload Hub:**
   * Allow users to edit their profile details (Name, Email) inline.
   * Seamless profile picture uploading via **Multer** and **Cloudinary**.
   * **Graceful Offline Fallback:** If Cloudinary keys are not provided in `.env`, the server automatically converts raw image buffers into **Base64 Data URIs** and saves them in Mongoose. Out-of-the-box avatar uploads work flawlessly in local development!
   * Visual loading spinners and modern, rounded letter-fallback icons are rendered across the Navbar and Sidebar.

4. **Automated Nodemailer Dispatches:**
   * Secure SMTP helper scaffolded with standard email transports.
   * **Safe Fallback:** If SMTP configurations are omitted, the dispatch logic gracefully logs beautifully formatted HTML emails straight to your console.

---

## 🏗️ Folder Structure

```text
/ (workspace root)
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection and helper configs
│   │   ├── controllers/     # Route controllers (Auth, Project, Task, Users, Dashboard)
│   │   ├── middleware/      # Auth, Role checking, Multer upload, Central Error Handler
│   │   ├── models/          # Mongoose Schemas (User, Project, Task)
│   │   ├── routes/          # Express route mappings
│   │   ├── utils/           # Scaffolding utilities (emailService)
│   │   ├── app.js           # Express application configurations
│   │   └── server.js        # Socket.io wrapper & Server bootloader
│   ├── package.json
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Common elements, layout structures (Sidebar, Navbar)
│   │   ├── context/         # Auth, Socket, Theme, and Toast Context Providers
│   │   ├── pages/           # Dashboard, Projects, Board, Workspace Tasks, Profile
│   │   ├── services/        # Axios API client wrapper
│   │   ├── App.jsx          # Router & context setups
│   │   ├── index.css        # Core styling and custom tailwind styles
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── package.json             # Root Orchestrator script list
└── README.md
```

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Socket.io-client.
* **Backend:** Node.js, Express.js, Socket.io (WebSockets), Multer, Cloudinary SDK, Nodemailer, JWT (JSON Web Tokens), `bcryptjs` password hashing.
* **Database:** MongoDB with Mongoose ORM.
* **Deployment:** Production-ready single-service layout (serving React directly from Express in production mode).

---

## 🚀 Getting Started Locally

### 1. Prerequisites
Ensure you have Node.js installed locally and a running MongoDB instance (either local `mongodb://localhost:27017` or a MongoDB Atlas connection string).

### 2. Installation
From the root folder, run the orchestrator script to automatically install dependencies for both the backend and frontend:
```bash
npm run install-all
```

### 3. Environment Variables
Configure your environment variables in `/backend/.env` (pre-configured for local out-of-the-box development):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
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
We have provided a comprehensive seeder to clear your database and instantly load pre-packaged **Admin** and **Member** accounts, project boards, and active overdue tasks:
```bash
npm run seed
```

**Seeded Credentials:**
* 👑 **Admin User:**
  * **Email:** `admin@example.com`
  * **Password:** `password123`
* 🧑 **Member User:**
  * **Email:** `member@example.com`
  * **Password:** `password123`

### 5. Running the Application

To run the **Backend API** and **Vite Dev Server** concurrently, use these root-level scripts:

* **Start Backend API** (Runs on port 5000):
  ```bash
  npm run dev-backend
  ```
* **Start Frontend Dev Server** (Runs on port 5173):
  ```bash
  npm run dev-frontend
  ```

Open your browser and navigate to `http://localhost:5173` to explore CollabFlow.

---

## 🛡️ Role-Based Access Controls (RBAC)

CollabFlow supports granular security permissions out of the box:

| Feature Permission | 👑 Project Admin | 🧑 Workspace Member |
| :--- | :---: | :---: |
| Create New Projects | ✅ Yes | ❌ No |
| Delete Projects & Scope | ✅ Yes | ❌ No |
| Invite Members to Project | ✅ Yes | ❌ No |
| Remove Members from Project | ✅ Yes | ❌ No |
| Create & Allocate Tasks | ✅ Yes | ❌ No |
| Edit Task Details & Priority | ✅ Yes | ❌ No |
| Delete Tasks | ✅ Yes | ❌ No |
| Move Kanban Cards (Status Updates) | ✅ Yes | ✅ Yes (Assigned Projects) |

---

## 🌐 Production & Railway Deployment

CollabFlow is engineered for a **single-service deploy** (serving the compiled React app directly from Express). This eliminates CORS challenges, reduces costs, and optimizes load times.

### How it works
In production mode (`NODE_ENV=production`), the Express backend serves static production bundles from `/frontend/dist`. All client routing queries that aren't API endpoints are routed directly to React Router.

### Deployment Steps:
1. Push this entire codebase to a GitHub repository.
2. Log in to [Railway.app](https://railway.app/) and select **New Project** -> **Deploy from GitHub**.
3. Choose your repository.
4. Set the following **Environment Variables** in Railway under the service settings:
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: (Your MongoDB Atlas connection URI or select Railway MongoDB Plugin)
   * `JWT_SECRET`: (Any secure random key)
5. Under Railway's Service settings, set the **Build Command** to:
   ```bash
   npm run install-all && npm run build
   ```
6. Set the **Start Command** to:
   ```bash
   npm start
   ```
7. Generate a domain under the networking settings. Your full-stack app is live!

---

## 📖 API Documentation

### Authentication (`/api/auth`)
* `POST /signup` - Register user. (Body: `name`, `email`, `password`, `role`)
* `POST /login` - Login. (Body: `email`, `password`)
* `GET /me` - Get current user profile. (Requires JWT Header)

### Projects (`/api/projects`)
* `POST /` - Create project. (Requires JWT, Admin only)
* `GET /` - List user's projects. (Requires JWT)
* `GET /:id` - Get project. (Requires JWT)
* `PUT /:id` - Edit project metadata. (Requires JWT, Project Admin only)
* `DELETE /:id` - Delete project. (Requires JWT, Project Admin only)
* `POST /:id/members` - Invite member by email. (Requires JWT, Project Admin only)
* `DELETE /:id/members/:userId` - Remove member. (Requires JWT, Project Admin only)

### Tasks (`/api/tasks`)
* `POST /` - Allocate task. (Requires JWT, Admin only)
* `GET /project/:projectId` - Fetch tasks. (Requires JWT)
* `PUT /:id` - Edit task. (Requires JWT, Admin only)
* `DELETE /:id` - Delete task. (Requires JWT, Admin only)
* `PATCH /:id/status` - Move task column status. (Requires JWT)

### Users & Avatars (`/api/users`)
* `GET /` - Fetch all users registered on CollabFlow. (Requires JWT, Admin only)
* `PUT /profile` - Update current user's profile details. (Requires JWT)
* `PUT /avatar` - Upload a profile image (Multer file transfer). Saves to Cloudinary or falls back to local Base64 buffers. (Requires JWT)

### Dashboard (`/api/dashboard`)
* `GET /stats` - Aggregate overview statistics. (Requires JWT)
#   E t h a r a A I  
 