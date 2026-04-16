# 🧠 Notes UX Upgrade - ThinkBack

## 🎯 Goal

Make Notes:

* easy to scan
* easy to search
* not overwhelming when data grows
* visually motivating to review

---

# 🧩 NOTES LIST REDESIGN

## ❌ Current Problem

* list dài → khó tìm
* không phân cấp → rối
* không có grouping → thiếu context
* không có pagination → lag khi nhiều data

---

## ✅ New Structure

```text
[ Search bar        ]  [ Filter by Topic ]

🔥 Today Review (5)
--------------------------------
- Two Sum
- Docker Network
- JWT Flow

📚 All Notes
--------------------------------
Topic: Algorithm (12)
  - Two Sum
  - Sliding Window

Topic: Backend (8)
  - JWT
  - Redis Cache
```

---

## 🧠 GROUP BY TOPIC (IMPORTANT)

* Notes phải được group theo Topic
* Collapse/Expand từng topic

---

## UI Behavior

* Click topic → expand/collapse
* Default:

  * expand topic có note cần review
  * collapse topic khác

---

# 🔍 SEARCH + FILTER

## Search

* search theo:

  * title
  * coreIdea

---

## Filter

* dropdown chọn topic
* hoặc click trực tiếp topic

---

# 📄 PAGINATION / INFINITE SCROLL

## Option 1 (Recommended)

👉 Infinite scroll

* load 20 notes / lần
* scroll xuống → load tiếp

---

## API

```http
GET /notes?limit=20&cursor=xxx
```

---

## Option 2

Pagination:

```text
< Prev | 1 | 2 | 3 | Next >
```

---

# 🧱 NOTE CARD DESIGN

## Replace list → card UI

---

## Card Layout

```text
+----------------------+
| 🧠 Two Sum           |
| Topic: Algorithm     |
| -------------------  |
| 🔁 Next: 2 days      |
| ⚡ Level: 2          |
+----------------------+
```

---

## States

### 🔥 Due Today

* highlight nhẹ (border / background)

---

### 💤 Not Due

* mờ hơn chút

---

## Hover

* show actions:

  * View
  * Edit
  * Delete

---

# 🔥 TODAY REVIEW BLOCK

## Top section (VERY IMPORTANT)

```text
🔥 You have 5 notes to review today
[ Review Now ]
```

---

## Behavior

* click → vào review flow
* show progress:

```text
Progress: 2 / 5
```

---

# 🎨 REVIEW BY TOPIC (UPGRADE UI)

## ❌ Current

* button list → xấu + không cuốn

---

## ✅ New UI (Card Style)

```text
+----------------------+
| 📘 Algorithm         |
| 5 notes to review    |
| [ Review ]           |
+----------------------+

+----------------------+
| ⚙️ Backend           |
| 2 notes to review    |
| [ Review ]           |
+----------------------+
```

---

## Behavior

* click "Review" → review theo topic
* sort:

  * topic nhiều note → lên trên

---

## Optional (rất nên)

Add progress bar:

```text
[██████----] 60%
```

---

# 🎯 MICRO UX (RẤT QUAN TRỌNG)

## 1. Empty State

```text
No notes yet
→ Create your first note
```

---

## 2. No Review Today

```text
🎉 Nothing to review today
```

---

## 3. Loading Skeleton

* hiển thị skeleton card
* tránh cảm giác lag

---

# ⚡ PERFORMANCE

## Backend

* index:

  * topicId
  * nextReviewAt

---

## Query

* không load toàn bộ notes
* luôn có limit

---

# 🧠 UX PRINCIPLES

* scan nhanh < 3s
* click ít nhất có thể
* nhìn là biết học gì

---

# 🚀 CLAUDE TASK

```text
Redesign Notes List UI:

- Group notes by topic
- Add collapse/expand topic
- Add search (title + coreIdea)
- Add topic filter
- Implement infinite scroll (cursor-based)

Replace list with card UI:
- show title, topic, review info
- highlight due notes
- add hover actions

Add Today Review section:
- show number of due notes
- add "Review Now" button

Redesign Review by Topic:
- use card UI instead of buttons
- show number of due notes
- sort by highest count
- optional progress bar

Improve UX:
- empty state
- loading skeleton
- no review state
```
