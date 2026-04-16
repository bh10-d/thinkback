# ✍️ Blog Editor & Sharing Upgrade - ThinkBack

## 🎯 Goal

Improve blog writing experience to be:

* fast (no friction)
* minimal (no complex editor)
* powerful enough (code + markdown)
* shareable (simple public link)

---

# 🧠 EDITOR DESIGN

## Core Principle

* Use **textarea + live preview**
* No toolbar
* No complex rich text editor

---

## Layout

```
+----------------------+----------------------+
|      Editor          |       Preview        |
|    (textarea)        |   (markdown render)  |
+----------------------+----------------------+
```

---

## Features

### 1. ✨ Auto Format (Lightweight)

Auto format basic markdown patterns.

#### Behavior

Input:

```
## two sum
```

Output:

```
## Two Sum
```

---

#### Implementation

```ts
function autoFormat(text: string) {
  return text.replace(/^##\s*(.*)/gm, (_, title) => {
    return "## " + title.charAt(0).toUpperCase() + title.slice(1);
  });
}
```

Trigger:

* onBlur
* Ctrl + S

---

### 2. ⌨️ Smart Enter (Notion-like)

#### Behavior

Typing:

```
- use hashmap
```

Press Enter →

```
- use hashmap
- |
```

---

#### Edge Case

Typing:

```
-
```

Press Enter →

→ remove `-`

---

### 3. 🎯 Highlight Current Line

* highlight line user is typing
* subtle background
* improve focus

---

### 4. 💾 Auto Save

* auto save every 3–5 seconds
* Ctrl + S to force save

---

### 5. 🧘 Focus Mode

* toggle hide preview
* full width editor

---

# 🖥️ MARKDOWN RENDERING

## Tech

* react-markdown
* syntax highlight (optional)

---

## Supported Markdown

Minimal only:

* headings (##)
* lists (-)
* code block (```)

---

## Example Input

User can write:

```
hôm nay mình học two sum
dùng map để giải
```

OR:

````markdown
## Two Sum

- dùng hashmap
- duyệt 1 lần

```go
func twoSum(...) {}
````

````

---

## Styling (IMPORTANT)

Clean & readable like Notion.

```css
.markdown {
  font-size: 16px;
  line-height: 1.7;
}

.markdown h2 {
  font-size: 22px;
  margin-top: 20px;
}

.markdown pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  overflow: auto;
}
````

---

# 🔗 BLOG SHARING

## Goal

* share knowledge easily
* no complexity

---

## Public Blog

Each blog has:

* slug (unique)
* isPublic (boolean)

---

## Example URL

```
/blog/two-sum-hashmap
```

---

## API

### Public Access

```
GET /public/blogs/:slug
```

* no auth required
* return blog content

---

## UI Features

### 1. Share Button

```
[ Copy Link ]
```

→ copy public URL

---

### 2. Toggle Public

```
Public: ON / OFF
```

* ON → accessible by link
* OFF → private

---

### 3. Read-only Mode

Public page:

* no edit
* no delete
* only view

---

# 🔄 NOTE → BLOG FLOW

From Note Detail:

Button:

```
Convert to Blog
```

---

## Behavior

Auto fill:

* title → blog title
* coreIdea → blog content

---

# 🧩 DATABASE UPDATE

## Blog Model

Add fields:

```ts
slug: string
isPublic: boolean
```

---

# ⚡ UX RULES

* writing must feel instant
* no lag
* no heavy UI
* keyboard-friendly

---

# 🚫 DO NOT

* do NOT use heavy editors (TipTap, Slate...)
* do NOT add toolbar
* do NOT over-design

---

# 🎯 FINAL EXPERIENCE

User should feel:

"I can just open and write immediately"

---

# 🚀 CLAUDE TASK

```
Improve Blog editor:
- Add smart enter for list
- Add auto formatting
- Highlight current line
- Add auto save + Ctrl+S
- Add focus mode

Improve markdown rendering:
- clean style (Notion-like)
- support headings, list, code block

Add Blog sharing:
- slug + isPublic
- public API
- copy link button
- public read-only page
```
