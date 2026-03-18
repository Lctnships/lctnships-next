---
name: deploy-check
description: Pre-deployment checklist — run build, lint, type check, and tests before deploying
disable-model-invocation: true
allowed-tools: Read, Bash, Grep, Glob
---

Run full pre-deployment verification:

## Current state
- Branch: !`git branch --show-current`
- Uncommitted changes: !`git status --short`

## Checks to run (stop on first failure)
1. **TypeScript**: `npx tsc --noEmit`
2. **ESLint**: `npx next lint`
3. **Build**: `npm run build`
4. **Tests**: `npx playwright test --reporter=list`

## Post-check
- Report pass/fail for each step
- If all pass: "Ready to deploy"
- If any fail: show the error and suggest a fix
