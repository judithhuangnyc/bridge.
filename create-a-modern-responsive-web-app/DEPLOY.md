# Deploy Bridge with Gemini

Bridge is a static Next.js export with one secure Netlify Function for Gemini. The public site remains lightweight; only the server function can access the Gemini key.

## One-time Netlify setup

Netlify Drop cannot deploy serverless functions, so use a Git-connected Netlify project instead:

1. Push this project to a GitHub, GitLab, or Bitbucket repository.
2. In Netlify, select **Add new project** → **Import an existing project**, then select that repository.
3. Netlify reads `netlify.toml` automatically. Confirm the build command is `pnpm run build` and the publish directory is `out`.
4. In Netlify, go to **Project configuration** → **Environment variables** → **Add a variable**.
5. Enter `GEMINI_API_KEY` as the key and paste your Gemini API key as the value. Set its scope to **Functions** (or **All scopes**). Do not add a `NEXT_PUBLIC_` prefix.
6. Save, then choose **Deploys** → **Trigger deploy** → **Deploy site**.

The key is used only by `netlify/functions/generate-story.mjs`; it is never included in browser code or the static `out/` files.

## Rebuild only when the design changes

```bash
PATH=/Users/judithhuang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node_modules/.bin/next build
```

Netlify will rebuild and deploy both the website and function automatically whenever you push a change.
