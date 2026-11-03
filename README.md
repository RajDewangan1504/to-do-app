# Taskly - SDE-1 Assessment

Responsive MERN-style task manager built from the assessment requirements and supplied mobile reference design.

## Structure

- `frontend` - Vite + React client
- `backend` - Express REST API with JSON-file persistence

## Run locally

```bash
cd backend
npm install
npm run dev

# in another terminal
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:4000/api` and can be overridden with `VITE_API_URL`.
