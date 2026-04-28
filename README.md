# DSA Teacher

A full-stack personal DSA learning app.

## Quick Start

### 1. Backend

```bash
cd server
cp .env.example .env        # fill in MongoDB URI + Firebase credentials
npm install
npm run dev                 # runs on port 5000
```

### 2. Frontend

```bash
cd client
cp .env.local.example .env.local   # fill in Firebase public config + API URL
npm install
npm run dev                        # runs on port 3000
```

### 3. Firebase setup

1. Create a project at console.firebase.google.com
2. Enable **Email/Password**, **Google**, and **GitHub** sign-in methods
3. Copy web app config to `client/.env.local`
4. Generate a service account key → copy values to `server/.env`

### 4. MongoDB

Create a free cluster at mongodb.com/atlas and paste the connection string into `server/.env`.

## Project Layout

```
dsa-teacher/
├── client/        # Next.js 14 + TailwindCSS frontend
├── server/        # Express + Mongoose backend
└── shared/        # dsa-patterns.json (single source of truth for all 28 patterns)
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/sync | Upsert user after Firebase login |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/profile | Update language / CP accounts |
| GET | /api/roadmap | All patterns (filterable) |
| GET | /api/roadmap/:id | Single pattern detail |
| GET | /api/progress | All progress rows for user |
| PUT | /api/progress/:patternId | Upsert a progress row |
| POST | /api/progress/:patternId/problems | Mark a problem solved |
| GET | /api/progress/chart/weekly | Last 12 weeks chart data |
| GET | /api/progress/stats/summary | Aggregate stats |
| GET | /api/integrations/leetcode/:username | LeetCode stats |
| GET | /api/integrations/codeforces/:handle | Codeforces stats |
| GET | /api/integrations/all | All linked platform stats |
