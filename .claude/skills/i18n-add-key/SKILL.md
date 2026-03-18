---
name: i18n-add-key
description: Add a new translation key to all locale files (nl, en, es, fr, de)
disable-model-invocation: true
allowed-tools: Read, Edit, Glob
---

Add translation key: $ARGUMENTS

## Current locales
!`ls messages/*.json`

## Steps
1. Parse the key path (e.g., `Dashboard.welcome` → nested under "Dashboard")
2. Add the key to ALL locale files in `messages/`:
   - `nl.json` — Dutch (primary, provide translation)
   - `en.json` — English
   - `es.json` — Spanish
   - `fr.json` — French
   - `de.json` — German
3. If user only provides English text, translate to other languages
4. Maintain existing JSON structure and alphabetical ordering within objects
5. Validate all JSON files are still valid after editing
