# 🤖 Copilot Instructions: Memeverse - The Meme Collection Web App

Hey Copilot! Here's the full context for this project so you can help me generate smarter, faster, and better code.

---

## 🌐 App Purpose

This web app is a **collection of internet memes** (image, gif, video) with support for:
- 🏷️ Tags (like `#uwu`, `#why-are-you-gay`)
- 🐱 Objects (like cat, frog, doge)
- 😡 Moods (like angry, sad, hyped)
- 🌍 Internationalization (English + Vietnamese)
- 🧠 AI-powered semantic search (e.g., "a screaming cat that is very angry")

---

## 🛠 Tech Stack

- **Frontend:** 
  - Next.js 15 (App Router) for Client website
  - Vite.js for CMS Admin panel
- **Backend-as-a-Service:** Appwrite
  - Realtime database
  - File storage
- **AI Agent (planned):** Google Gemini (temporary) → local model in future
- **Hosting:** Vercel (frontend), Appwrite Cloud or self-host (backend)

---

## 🗃️ Database Design (Appwrite)

### `memes` Collection
- `title_en`: string (optional)
- `title_vi`: string (optional)
- `desc_en`: string
- `desc_vi`: string
- `type`: enum (`image`, `gif`, `video`)
- `objectIds`: array<string> — references `objects` collection
- `tagIds`: array<string> — references `tags` collection
- `moodIds`: array<string> — references `moods` collection
- `fileId`: string — file in Appwrite Storage or external source
- `filePreview`: string (optional) — URL for preview image
- `saved_platform`: enum (`appwrite`, `imagekit`) - platform where meme media is saved
- `usageCount`: number (optional, for sorting)

### `tags` Collection
- `label`: string
- `usageCount`: number (optional, for sorting)
- `lastUsedAt`: date (optional, for sorting)
- `trendingScore`: number (optional, for sorting)

### `objects` Collection
- `label_en`, `label_vi`: string
- `slug`: string
- `usageCount`: number (optional, for sorting)
- `lastUsedAt`: date (optional, for sorting)
- `trendingScore`: number (optional, for sorting)

### `moods` Collection
- `label_en`, `label_vi`: string
- `slug`: string
- `usageCount`: number (optional, for sorting)
- `lastUsedAt`: date (optional, for sorting)
- `trendingScore`: number (optional, for sorting)

---

## 💥 Key Features

- All memes can be downloaded with one click
- Content type support: image, gif, video
- Internationalization (i18n) with `next-intl` or `react-i18next`
- AI-powered meme search using natural text queries
- Admin panel or moderation system for community-safe meme uploads
- Users can request to upload memes (checked by AI + admin)

---

## 🧠 AI Search Assistant (planned)

User input:  
> "a very angry screaming cat meme"

System parses that with AI into:
```json
{
  "object": "cat",
  "tags": ["cat", "angry", "screaming"],
  "moods": ["angry"],
  "context": ["cat", "angry", "screaming"]
}
