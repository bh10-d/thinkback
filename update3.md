# 🧠 ThinkBack - Personal Learning System

## 🎯 Goal

Build a minimal but addictive system to help users:

* remember what they learned
* actively recall knowledge
* review at the right time
* write and organize knowledge (blog)

This is NOT a note app.
This is a **personal learning system**.

---

# 🧩 Core Modules

1. Notes (quick learning units)
2. Review system (spaced repetition)
3. Topics (organization)
4. Blog (deep understanding)

---

# 🧠 NOTE SYSTEM

## Structure

Each note:

* title
* questions (string[])
* coreIdea
* mistake
* example
* topicId

Review fields:

* reviewLevel
* nextReviewAt
* lastReviewedAt

---

# 🔁 REVIEW SYSTEM

## Flow

1. Show:

   * title
   * questions

2. User types answer (min 5 chars)

3. Click "Check Answer"

4. System evaluates answer

5. Show:

   * Match %
   * Suggested result:

     * Remembered
     * Partially
     * Forgot

6. User confirm or override

7. Click "Reveal"

8. Show:

   * coreIdea
   * mistake
   * example

---

## ⏱️ Spaced Repetition

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

## 🔥 Review Modes

### 1. Review All

* review all due notes

### 2. Review by Topic

* filter by topicId

API:

GET /notes/today
GET /notes/today?topicId=xxx

---

# 🧩 TOPIC SYSTEM

## Topic Model

* id
* name
* createdAt

---

## Features

* Create topic inline
* Select or create topic when adding note
* Filter notes by topic

---

## UI

Use select with tag mode:

```tsx id="o86hws"
<Select mode="tags" placeholder="Select or create topic" />
```

---

# 🧱 BACKEND (NestJS)

## Tech

* NestJS
* PostgreSQL
* Prisma

---

## Models

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

### Blog

* id
* title
* content (markdown)
* topicId
* createdAt
* updatedAt

---

## APIs

### Topics

POST /topics
GET /topics
DELETE /topics/:id

---

### Notes

POST /notes
GET /notes
GET /notes/:id
PATCH /notes/:id
DELETE /notes/:id

GET /notes/today

---

### Review

POST /review

---

### Blog

POST /blogs
GET /blogs
GET /blogs/:id
PATCH /blogs/:id
DELETE /blogs/:id

---

# 🧠 ANSWER MATCHING

## Normalize

```ts id="s8rzm5"
function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}
```

---

## Similarity

```ts id="z6xp6y"
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

## Evaluate

```ts id="y6fj1v"
function evaluate(userAnswer: string, coreIdea: string) {
  const score = similarity(userAnswer, coreIdea);

  if (score > 0.6) return { result: "Remembered", score };
  if (score > 0.3) return { result: "Partially", score };
  return { result: "Forgot", score };
}
```

---

# 🌐 FRONTEND

## Tech

* React + Vite
* Ant Design

---

# 🖥️ UI SCREENS

---

## 1. Dashboard

* "🔥 X notes to review"
* Button: Review All

Also show:

* Review by Topic buttons

---

## 2. Review Screen

Flow:

1. Show title + questions
2. Input answer
3. Check Answer
4. Show match %
5. Confirm / override
6. Reveal
7. Show coreIdea + mistake + example

---

## 3. Notes List

* Search
* Filter by topic
* List notes

Click → open Note Detail

---

## 4. Note Detail

Show:

* title
* topic
* questions
* coreIdea
* mistake
* example

Actions:

* Edit
* Delete (with confirm)
* Convert to Blog

---

## 5. Add / Edit Note

Fields:

* title
* topic
* questions (multiple inputs)
* coreIdea
* mistake
* example

---

# ✍️ BLOG SYSTEM

## Goal

* write what user understands
* simple typing experience
* support code writing

---

## Editor Design (IMPORTANT)

Use:

* textarea (left)
* live preview (right)

---

## Behavior

* User can write normal text (no markdown required)
* Markdown is optional

---

## Minimal Markdown Support

* ## → heading
* * → list
* ```→ code block  
  ```

---

## Example

User can write:

```text id="t3my2l"
hôm nay mình học two sum
dùng map để giải
```

OR:

````markdown id="y2n9q1"
## Two Sum

- dùng hashmap
- duyệt 1 lần

```go
func twoSum(...) {}
````

```

---

## Rendering

Use:

- react-markdown
- syntax highlight for code

---

## UI Layout

Left: editor  
Right: preview  

---

## UX Rules

- Auto save (every few seconds)
- Ctrl + S to save
- Focus mode (hide preview)
- No toolbar
- No clutter

---

# 🔗 NOTE → BLOG

In Note Detail:

Button:

"Convert to Blog"

Auto fill:

- title
- coreIdea → content

---

# ⚡ UX PRINCIPLES

- Minimal
- Clean
- Fast
- Keyboard-friendly
- Focus on thinking

---

# 🧠 BEHAVIOR RULES

- Must type before reveal (min 5 chars)
- Editing note does NOT reset progress
- Delete must confirm
- Notes always viewable

---

# 🚀 OPTIONAL

- Telegram bot reminder
- Streak system
- Heatmap
- Public blog sharing

---

# ⚠️ IMPORTANT

Do NOT over-engineer  
Do NOT add complex editors  
Do NOT add unnecessary features  

---

# 🎯 FINAL GOAL

The system must feel:

"simple but powerful"

User should:

- open daily
- review quickly
- write easily
- actually remember things
```
