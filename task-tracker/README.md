# TaskFlow — Student Task Tracker

A full-stack MERN application to help students manage daily internship and study tasks.
Built for **JIET Open Innovations Labs — Internship Task 1**.

---

## Screenshots

> Add your screenshots here after running the app:
> - `screenshots/task-list.png` — main task grid
> - `screenshots/add-task.png` — add/edit form modal
> - `screenshots/dashboard.png` — stats dashboard

---

## Features

| Area       | What's implemented |
|------------|--------------------|
| Dashboard  | Live counts — Total, Pending, In Progress, Completed, Overdue |
| Tasks      | Create, Read, Update, Delete (full CRUD) |
| Task fields | Title, Description, Due Date, Status, Priority, Tags |
| Logic      | Overdue detection (due date < today & not completed), status quick-change inline |
| Search     | Real-time search by title or description |
| Filter     | Filter by status, priority, sort order |
| UI states  | Loading spinner, empty state, error banner with retry |
| Validation | Frontend + backend validation with field-level errors |
| Animations | Card stagger, modal slide-up, hover lift, button transitions |
| Responsive | Works on mobile, tablet, and desktop |

---

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express 4
- **Database**: MongoDB Atlas (Mongoose 8)
- **Validation**: express-validator (backend) + custom (frontend)

---

## Project Structure

```
task-tracker/
├── server/
│   ├── models/
│   │   └── Task.js            # Mongoose schema & isOverdue virtual
│   ├── routes/
│   │   └── tasks.js           # All CRUD routes + /stats
│   ├── middleware/
│   │   └── validation.js      # express-validator rules
│   ├── server.js              # Entry point, DB connect, middleware
│   ├── .env.example           # Environment variable template
│   └── package.json
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── tasks.js       # Fetch wrapper for all API calls
    │   ├── components/
    │   │   ├── Dashboard.jsx  # Stats cards
    │   │   ├── TaskCard.jsx   # Individual task display
    │   │   ├── TaskForm.jsx   # Add/Edit modal form
    │   │   └── SearchFilter.jsx # Search + filter controls
    │   ├── App.jsx            # Root component, state & handlers
    │   ├── main.jsx           # React entry point
    │   └── index.css          # All styles (CSS variables, animations)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup & Run Locally

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/task-tracker.git
cd task-tracker
```

### 2. Set up MongoDB Atlas

1. Create a free cluster on MongoDB Atlas.
2. Go to **Database Access** → Add a user with read/write privileges.
3. Go to **Network Access** → Allow `0.0.0.0/0` (or your IP).
4. Click **Connect** → **Connect your application** → copy the connection string.

### 3. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/task-tracker?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
```

### 4. Install server dependencies & start

```bash
# inside /server
npm install
npm run dev      # uses nodemon for hot reload
# or
npm start        # production
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### 5. Install client dependencies & start

```bash
cd ../client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> The Vite dev server proxies `/api` requests to `localhost:5000`, so no CORS issues in development.

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | `/tasks`              | List tasks (supports ?search, ?status, ?priority, ?sort) |
| GET    | `/tasks/stats`        | Get counts (total, pending, etc.) |
| GET    | `/tasks/:id`          | Get single task                 |
| POST   | `/tasks`              | Create a task                   |
| PUT    | `/tasks/:id`          | Update a task (full replace)    |
| PATCH  | `/tasks/:id/status`   | Update status only              |
| DELETE | `/tasks/:id`          | Delete a task                   |

### Task Object

```json
{
  "_id": "...",
  "title": "Complete React assignment",
  "description": "Build a todo app with hooks",
  "dueDate": "2024-07-10T00:00:00.000Z",
  "status": "pending",
  "priority": "high",
  "tags": ["react", "frontend"],
  "isOverdue": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Environment Variables

| Variable        | Required | Description                        |
|-----------------|----------|------------------------------------|
| `PORT`          | No       | Server port (default: 5000)        |
| `MONGO_URI`     | Yes      | MongoDB Atlas connection string    |
| `CLIENT_ORIGIN` | No       | React app URL for CORS (default: http://localhost:5173) |

---

## How AI Was Used

Claude (Anthropic) was used to:
- Scaffold the initial folder structure and boilerplate
- Generate Mongoose schema with virtual properties
- Write express-validator middleware
- Build React components and CSS design system

All generated code was reviewed, understood, and customised. During review I can explain:
- **Folder structure**: server (models/routes/middleware) and client (components/api) separation
- **Database design**: Task schema fields, timestamps, isOverdue virtual
- **API flow**: Request → validation middleware → route handler → MongoDB → JSON response
- **React components**: How state lifts from App down to TaskCard/TaskForm via props
- **Validation logic**: Frontend validates before submission; backend validates with express-validator before DB write
- **Frontend ↔ Backend**: Vite proxy forwards `/api` to Express; `api/tasks.js` wraps all fetch calls

---

## Deployment Notes

- Add your production domain to `CLIENT_ORIGIN` in the server `.env`
- Build the client with `npm run build` and serve the `dist/` folder
- Never commit your `.env` file — use `.env.example` as template

---

*Built with ❤️ for JIET Open Innovations Labs Internship*
