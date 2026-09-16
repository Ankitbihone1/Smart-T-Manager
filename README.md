# Smart Task Manager

Full-stack assignment implementation using:
- Frontend: Next.js + React
- Backend: Node.js + Express.js
- Storage: In-memory JavaScript Maps
- Styling: Tailwind CSS

## Features
- Create users
- Mock login
- View all users
- Create, edit and delete tasks
- Assign tasks to users
- Priority: Low / Medium / High
- Status: To Do / In Progress / Done
- Task dependencies
- Dependency validation when completing a task
- Blocked task detection
- My Tasks
- All Tasks
- Priority/status filtering

## Run the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

## Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on the Next.js development URL shown in the terminal.

## Important
This project uses in-memory storage. Restarting the backend clears all users and tasks.
