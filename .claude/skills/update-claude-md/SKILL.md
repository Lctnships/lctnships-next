---
name: update-claude-md
description: Update CLAUDE.md with any new structural changes (routes, schema, env vars, dependencies) since the last update
---

# /update-claude-md

Reviews recent changes in this repo and updates `CLAUDE.md` if there are structural changes worth documenting.

## What it checks

Runs `git log` + `git diff` against these areas since the last commit that touched `CLAUDE.md`:

- `supabase/migrations/` — new tables, columns, indexes
- `src/app/api/` — new or renamed API routes
- `src/middleware.ts` — routing/auth/rate-limiting changes
- `package.json` — new dependencies
- `.env.example` — new required env vars
- `src/i18n/` — locale changes
- `src/lib/stripe/`, `src/lib/supabase/` — infrastructure changes

## Steps

1. Run: `git log --oneline --follow CLAUDE.md` to find the last CLAUDE.md update commit
2. Run: `git log <last-sha>..HEAD --oneline --stat` to see what changed since
3. Run: `git diff <last-sha>..HEAD -- supabase/migrations src/app/api src/middleware.ts package.json .env.example src/i18n src/lib/stripe src/lib/supabase`
4. Read the current `CLAUDE.md`
5. For each structural change found, update the relevant section of `CLAUDE.md`
6. **DO NOT** add entries for bug fixes, styling changes, or one-off utilities
7. Keep the existing style — concise bullets, no verbose prose
8. If no structural changes are found, output `No structural changes — CLAUDE.md is up to date.` and exit

## Sections in CLAUDE.md you can update

- `## Tech Stack` — for dependency or service additions
- `## Architecture > Route structure` — for new route groups or API routes
- `## Architecture > Database` — for new tables
- `## Architecture > Middleware` — for middleware changes
- `## Architecture > i18n` — for locale changes
- `## Environment variables` — for new env vars

## After updating

1. Show a diff of what changed in CLAUDE.md
2. Let the user decide if they want to commit it
3. Do NOT auto-commit
