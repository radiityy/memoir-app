# Memoir

A photo memory journaling app built with Next.js and Supabase. Users can document daily moments with photos, captions, moods, and places, then revisit them through search, filters, or time-based features like On This Day and Recap.

**Live:** [memoirdiary.vercel.app](https://memoirdiary.vercel.app)

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (auth, database, storage)

## Pages & Features

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login`, `/register` | Authentication with protected route handling |
| `/feed` | Browse, search, and filter all memories |
| `/memory/[id]` | Memory detail view |
| `/memory/[id]/edit` | Edit memory |
| `/upload` | Upload photo with caption, mood, and place |
| `/recap` | Review past memories as a summary |
| `/on-this-day` | Surface memories from the same date in previous years |
| `*` | Custom 404 page |

Photos are stored privately via Supabase Storage and only accessible to the authenticated user. The app includes full metadata and favicon configuration.
