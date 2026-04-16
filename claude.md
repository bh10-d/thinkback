You are a senior fullstack engineer. Build a production-ready MVP for a **Spaced Repetition Learning Tool for Developers**.

## 🎯 Goal

Create a minimal but highly addictive tool that helps users:

* remember what they learned
* actively recall knowledge
* track mistakes
* get reminded to review at the right time

This is NOT a note-taking app. This is a **recall-driven learning system**.

---

## 🧩 Core Concept

Each note must follow this structure:

* title (short)
* questions (array of recall questions) ⭐ MOST IMPORTANT
* coreIdea (1–3 lines max)
* mistake (common mistakes)
* example (small example)

---

## 🔁 Review Flow (CRITICAL)

When user reviews a note:

1. Show ONLY:

   * title
   * questions

2. User must THINK (optionally type answer)

3. Only after clicking "Reveal", show:

   * coreIdea
   * mistake
   * example

4. Then user selects:

   * 😎 Remembered
   * 🤔 Partially
   * ❌ Forgot

---

## ⏱️ Spaced Repetition Logic

Use this schedule:

* level 0 → +1 day
* level 1 → +3 days
* level 2 → +7 days
* level 3 → +14 days
* level 4 → +30 days

If:

* Remembered → level +1
* Partially → stay same level, +1 day
* Forgot → reset level = 0, +1 day

Each note must have:

* reviewLevel
* nextReviewAt
* lastReviewedAt

---

## 🔥 Anti-Lazy System (IMPORTANT)

* Notes NOT reviewed must accumulate (review debt)
* Show dashboard:
  "🔥 You have X notes to review"
* Do NOT auto-dismiss missed reviews
* Optional: block adding new notes if too many pending

---

## 🧱 Backend (NestJS)

Tech:

* NestJS
* PostgreSQL
* Prisma ORM

Modules:

* Auth (simple, optional)
* Notes
* Review

APIs:

POST /notes
GET /notes
GET /notes/today
POST /review

Data model:

Note:

* id
* title
* questions (string[])
* coreIdea
* mistake
* example
* reviewLevel
* nextReviewAt
* lastReviewedAt
* createdAt

---

## 🌐 Frontend (React + Vite + Tailwind)

### UI Principles (VERY IMPORTANT)

* Minimal
* Clean
* No flashy colors
* High focus
* Addictive to use
* Fast interactions

Think:

* Notion + Anki + Linear style

---

## 🖥️ Screens

### 1. Dashboard

* "🔥 X notes to review today"
* Button: Start Review

---

### 2. Review Screen (MOST IMPORTANT UX)

Step 1:

* Show title
* Show questions

Step 2:

* Button: Reveal

Step 3:

* Show coreIdea, mistake, example

Step 4:

* 3 buttons:

  * Remembered
  * Partially
  * Forgot

---

### 3. Add Note Screen

Fields:

* title
* questions (multiple input)
* coreIdea
* mistake
* example

---

### 4. Notes List

* filter by topic (optional)
* simple list

---

## 🎨 UI Design Rules

* Use whitespace heavily
* Large readable text
* Smooth transitions (subtle)
* No clutter
* Focus on typing & thinking

---

## 🤖 Optional (if possible)

* simple cron job:

  * log how many notes need review
* prepare structure for future Telegram bot

---

## 🚀 Output Requirement

* Full backend code (NestJS)
* Full frontend code (React)
* Clear folder structure
* Setup instructions
* Environment variables

---

## ⚠️ Important

Do NOT over-engineer.
Do NOT add unnecessary features.
Focus on:

* recall experience
* simplicity
* speed

This tool must feel:
"simple but powerful"
