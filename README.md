# ThinkBack

Spaced Repetition Learning Tool for Developers.

## Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: React + Vite + Ant Design

## Setup

### 1. PostgreSQL

Create a database named `thinkback`.

### 2. Backend

```bash
cd backend
npm install

cp .env.example .env
# Edit .env: DATABASE_URL="postgresql://user:password@localhost:5432/thinkback"

npx prisma migrate dev --name init
npx prisma generate

npm run start:dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API

| Method | Path           | Description              |
|--------|----------------|--------------------------|
| POST   | /topics        | Create a topic           |
| GET    | /topics        | List all topics          |
| POST   | /notes         | Create a note            |
| GET    | /notes         | List all notes           |
| GET    | /notes/today   | Get notes due today      |
| POST   | /review        | Submit a review result   |

## Review Flow

1. See title + questions
2. **Type your answer** (required, min 5 chars)
3. Click **Check Answer** → system runs similarity matching
4. See **Match %** + suggested result
5. Accept suggestion or **override** manually
6. Click **Reveal** → see coreIdea, mistake, example
7. Click **Next** → saves review, moves to next note

## Spaced Repetition Schedule

| Level | Next review |
|-------|-------------|
| 0     | +1 day      |
| 1     | +3 days     |
| 2     | +7 days     |
| 3     | +14 days    |
| 4     | +30 days    |

- **Remembered** → level +1
- **Partially** → same level, +1 day
- **Forgot** → level reset to 0, +1 day
