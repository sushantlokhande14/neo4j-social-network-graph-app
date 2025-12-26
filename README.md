# Social Media App

A social media application built with FastAPI (Python) backend and React (TypeScript) frontend, using Neo4j as the graph database and Clerk for authentication.

## Tech Stack

- **Backend**: FastAPI, Neo4j, Clerk authentication
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Clerk
- **Database**: Neo4j (graph database)

## Prerequisites

- Python 3.10+
- Node.js 18+
- Neo4j database (local or [Aura](https://neo4j.com/cloud/aura/))
- [Clerk](https://clerk.com) account for authentication

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/aishse/CS157C-Team3.git
cd CS157C-Team3
git checkout social-media-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
```

Edit `backend/.env` with your credentials:
- `NEO4J_URI` - Your Neo4j connection URI
- `NEO4J_USERNAME` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password
- `CLERK_SECRET_KEY` - From Clerk dashboard → API Keys

Start the backend server:
```bash
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env.local
```

Edit `frontend/.env.local`:
- `VITE_API_BASE_URL` - Backend URL (default: http://localhost:8000)
- `VITE_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard → API Keys

Start the frontend dev server:
```bash
npm run dev
```

Frontend runs at: http://localhost:5173

## Clerk Setup

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Go to API Keys and copy:
   - **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY` (frontend)
   - **Secret Key** → `CLERK_SECRET_KEY` (backend)

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Neo4j connection
│   │   ├── models/          # Pydantic models
│   │   ├── routers/         # API routes
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Auth middleware
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   └── providers/       # Context providers
│   └── package.json
└── README.md
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
