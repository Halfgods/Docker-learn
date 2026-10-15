# NoteNest

A tiny full-stack notes app: **React** frontend + **Python (Flask)** backend.

## Run locally

Backend:
```bash
cd backend
pip install -r requirements.txt
python app.py          # http://localhost:5000
```

Frontend:
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api to :5000)
```

## Structure

```
.
├── backend/       Flask API
└── frontend/      React (Vite) app
```
