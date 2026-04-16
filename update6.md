# 🚀 ThinkBack - Advanced UX & Production Upgrade

## 🎯 Goal

* quản lý topic tốt hơn (có delete)
* tăng động lực học (streak + heatmap)
* UI sống động (nhưng không lố)
* codebase sạch như production

---

# 🧩 TOPIC MANAGEMENT (ADD DELETE)

## ❌ Problem

* không thể xóa topic → rác dần
* UX thiếu hoàn chỉnh

---

## ✅ Solution

### UI Placement

👉 Trong **Notes List → Sidebar / Filter**

```text
Topics
-----------------
Algorithm   (⋯)
Backend     (⋯)
English     (⋯)
```

---

### Action Menu

Click `(⋯)`:

```text
- Rename
- Delete
```

---

### Delete Flow (IMPORTANT)

1. Click Delete
2. Show confirm modal:

```text
Delete topic "Algorithm"?

⚠️ All notes will:
- be moved to "No Topic"
OR
- be deleted (optional choice)

[ Cancel ] [ Confirm ]
```

---

## Backend Rule

* không được orphan note

---

## API

```http
DELETE /topics/:id
```

Optional:

```http
DELETE /topics/:id?mode=move
DELETE /topics/:id?mode=delete
```

---

# 🔥 STREAK SYSTEM

## 🎯 Goal

Tạo cảm giác:

"không muốn mất streak"

---

## Logic

* mỗi ngày nếu review ≥ 1 note → +1 streak
* nếu skip 1 ngày → reset streak

---

## Model

```ts
streakCount: number
lastReviewDate: Date
```

---

## UI

Top Dashboard:

```text
🔥 3 day streak
```

---

## Behavior

* animate khi tăng streak
* highlight khi đạt milestone (3, 7, 30)

---

# 🔥🔥 FIRE ANIMATION (OPTIONAL BUT RECOMMENDED)

## ✅ NÊN làm nhưng nhẹ thôi

---

## UI

```text
🔥 3 day streak
```

👉 flame có animation nhẹ:

* scale lên xuống
* opacity flicker

---

## Example (CSS)

```css
.fire {
  animation: flicker 1.5s infinite;
}

@keyframes flicker {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}
```

---

## ❌ DO NOT

* không dùng animation quá mạnh
* không nhấp nháy nhanh

---

# 📅 HEATMAP (GITHUB STYLE)

## 🎯 Goal

* visualize learning habit
* nhìn là biết học đều hay không

---

## UI

```text
[ ] [■] [■■] [■■■] ...
```

---

## Data

* mỗi ngày:

  * 0 review → empty
  * 1–2 → light
  * 3–5 → medium
  * 6+ → dark

---

## API

```http
GET /stats/heatmap
```

---

## Response

```json
[
  { "date": "2026-04-01", "count": 3 },
  { "date": "2026-04-02", "count": 0 }
]
```

---

## UI Placement

Dashboard:

```text
🔥 streak
📅 heatmap (last 30–90 days)
```

---

## UX

* hover → show count
* click → filter notes that day (optional)

---

# 🧱 FOLDER STRUCTURE (PRODUCTION READY)

## Backend (NestJS)

```bash
src/
├── modules/
│   ├── notes/
│   ├── topics/
│   ├── review/
│   ├── blogs/
│   ├── stats/
│
├── common/
│   ├── dto/
│   ├── utils/
│   ├── constants/
│
├── config/
│   ├── env.config.ts
│   ├── database.config.ts
│
├── prisma/
│
├── main.ts
```

---

## Frontend (React)

```bash
src/
├── components/
│   ├── ui/
│   ├── note/
│   ├── blog/
│
├── pages/
│   ├── dashboard/
│   ├── notes/
│   ├── review/
│   ├── blog/
│
├── hooks/
├── services/
├── store/
├── utils/
├── config/
│   ├── env.ts
```

---

# ⚙️ ENV CONFIG (IMPORTANT)

## ❌ Problem

* config hardcode → khó maintain

---

## ✅ Solution

### Backend `.env`

```env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=xxx
```

---

## Backend Config

```ts
export default () => ({
  port: process.env.PORT,
  db: process.env.DATABASE_URL,
});
```

---

## Frontend `.env`

```env
VITE_API_URL=http://localhost:3000
```

---

## Usage

```ts
const API_URL = import.meta.env.VITE_API_URL;
```

---

# 🎯 DASHBOARD FINAL LOOK

```text
🔥 5 day streak
📅 Heatmap

🔥 3 notes to review today
[ Review Now ]

📘 Review by Topic
- Algorithm (3)
- Backend (1)
```

---

# 🚀 CLAUDE TASK

```text
Add Topic Management:
- Add delete topic (with confirm)
- Handle notes when deleting topic (move or delete)

Add Streak System:
- Track daily review
- Show streak on dashboard
- Add simple animation

Add Heatmap:
- API for daily review count
- Render GitHub-style heatmap

Improve UI:
- Add subtle fire animation for streak
- Keep animation minimal

Refactor Codebase:
- reorganize folder structure (backend + frontend)
- move config to .env
- remove hardcoded values
```

---

# 🧠 FINAL PRINCIPLE

* tính năng phải giúp user quay lại mỗi ngày
* UI phải tạo cảm giác “muốn học”
* code phải đủ sạch để scale

---

# 🔥 FINAL RESULT

App của bạn sẽ:

* có habit loop (streak + heatmap)
* có organization (topic + note)
* có expression (blog)
* có UX đủ tốt để dùng thật

→ không còn là side project nữa
