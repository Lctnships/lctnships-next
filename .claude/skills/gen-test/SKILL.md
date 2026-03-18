---
name: gen-test
description: Generate Playwright E2E tests following project conventions
disable-model-invocation: true
allowed-tools: Read, Write, Grep, Glob
---

Generate Playwright tests for: $ARGUMENTS

## Reference patterns
!`cat tests/smoke.spec.ts`

## Config
!`cat playwright.config.ts`

## Conventions
- Place tests in `tests/` directory
- Base URL: `http://localhost:3002`
- Default locale is `nl` — pages load at root or `/nl/` prefix
- Use descriptive `test.describe` blocks
- Follow existing assertion patterns (toBeVisible, toHaveTitle, etc.)
- For authenticated flows, document what manual setup is needed
- Name files: `{feature}.spec.ts`
