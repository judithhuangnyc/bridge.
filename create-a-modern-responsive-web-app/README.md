# Bridge

Bridge is a responsive Next.js MVP for an AI-powered storytelling platform supporting crisis-affected learners.

## Run locally

```bash
pnpm install
pnpm dev
```

Then visit `http://localhost:3000`.

## Supabase

Set these values in `.env.local` when the backend is ready:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The starter client is at `lib/supabase.ts`. Authentication, profiles, and stories can be layered onto the current UI without changing its visual components.
