# 🧠 ThinkBack - Spaced Repetition Learning Tool

## 🎯 Goal

Build a minimal but addictive learning tool that helps users:

* remember what they learned
* actively recall knowledge
* track mistakes
* review at the right time

This is NOT a note-taking app.
This is a **recall-driven learning system**.

---

## 🧩 Core Data Structure

Each note must include:

* title (string)
* questions (string[])
* coreIdea (string)
* mistake (string)
* example (string)
* topicId (string)

Review fields:

* reviewLevel (number)
* nextReviewAt (datetime)
* lastReviewedAt (datetime)

---

## 🔁 Review Flow (CRITICAL)

### Step 1

Show:

* title
* questions

### Step 2

User types answer (required, min 5 characters)

### Step 3

Click "Check Answer"

### Step 4

System auto evaluates answer (matching logic)

### Step 5

Show:

* Match % (e.g. 65%)
* Suggested result:

  * Remembered
  * Partially
  * Forgot

### Step 6

User can:

* Accept suggestion
* Override manually

### Step 7

Click "Reveal"

Show:

* coreIdea
* mistake
* example

---

## ⏱️ Spaced Repetition Logic

Level system:

* level 0 → +1 day
* level 1 → +3 days
* level 2 → +7 days
* level 3 → +14 days
* level 4 → +30 days

Rules:

* Remembered → level +1
* Partially → keep level, +1 day
* Forgot → reset level = 0, +1 day

---

## 🔥 Anti-Lazy System

* Notes not reviewed accumulate (review debt)
* Dashboard must show:
  "🔥 You have X notes to review"
* Do NOT auto-clear missed reviews
* Optional:
  block adding new notes if too many pending

---

## 🧱 Backend (NestJS)

### Tech

* NestJS
* PostgreSQL
* Prisma

---

## 🧩 Data Models

### Topic

* id
* name
* createdAt

### Note

* id
* title
* questions (string[])
* coreIdea
* mistake
* example
* topicId
* reviewLevel
* nextReviewAt
* lastReviewedAt
* createdAt

---

## 🌐 APIs

### Topic APIs

POST /topics
GET /topics
DELETE /topics/:id (optional)

---

### Note APIs

POST /notes
GET /notes
GET /notes/:id
PATCH /notes/:id
DELETE /notes/:id

GET /notes/today (notes need review)

---

### Review API

POST /review

---

## 🧠 Answer Matching Logic

### Normalize

```ts
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}
```

---

### Similarity

```ts
function similarity(a: string, b: string) {
  const wordsA = new Set(normalize(a).split(" "));
  const wordsB = new Set(normalize(b).split(" "));

  let match = 0;
  wordsA.forEach(w => {
    if (wordsB.has(w)) match++;
  });

  return match / Math.max(wordsA.size, wordsB.size);
}
```

---

### Evaluate

```ts
function evaluate(userAnswer: string, coreIdea: string) {
  const score = similarity(userAnswer, coreIdea);

  if (score > 0.6) return { result: "Remembered", score };
  if (score > 0.3) return { result: "Partially", score };
  return { result: "Forgot", score };
}
```

---

## 🌐 Frontend

### Tech

* React + Vite
* Ant Design

---

## 🖥️ Screens

---

### 1. Dashboard

* "🔥 X notes to review"
* Button: Start Review

---

### 2. Review Screen (MOST IMPORTANT)

Flow:

1. Show title + questions
2. Input answer (required)
3. Button: Check Answer
4. Show:

   * Match %
   * Suggested result
5. User confirm or override
6. Button: Reveal
7. Show:

   * coreIdea
   * mistake
   * example

---

### 3. Notes List

* Search input
* Filter by topic
* List all notes

Each item:

* title
* topic

Click → go to Note Detail

---

### 4. Note Detail (VIEW MODE)

Show full note:

* title
* topic
* questions
* coreIdea
* mistake
* example

Actions:

* Edit button
* Delete button (with confirm)

---

### 5. Add Note

Fields:

* title
* topic (select or create inline)
* questions (multiple inputs)
* coreIdea
* mistake
* example

---

### 6. Edit Note

* Same UI as Add Note
* Pre-fill existing data
* Save updates

---

## 🧩 Topic Management

### Backend

POST /topics
GET /topics
DELETE /topics/:id

---

### Frontend

* Use dropdown (Antd Select)
* Allow:

  * selecting topic
  * typing to create new topic (tags mode)

Example:

```tsx
<Select mode="tags" placeholder="Select or create topic" />
```

---

## ⚡ UX Rules

* Must type before reveal (min 5 chars)
* No clutter
* Big readable text
* Fast interaction
* Smooth but subtle transitions

---

## 🎨 UI Principles

* Minimal
* Clean
* No flashy colors
* Focus on thinking

Style inspiration:

* Notion
* Linear
* Anki

---

## 🧠 Behavior Rules

* Editing note does NOT reset progress
* Deleting note requires confirmation
* Notes must always be accessible (view anytime)

---

## 🚀 Optional (Future)

* Telegram bot reminder
* Streak system
* Heatmap (like GitHub)
* Sync across devices

---

## ⚠️ Important

Do NOT over-engineer
Do NOT add unnecessary features

Focus on:

* recall experience
* simplicity
* speed

---

## 🎯 Final Goal

This tool should feel:

"simple but powerful"

User should:

* open daily
* review quickly
* actually remember things
