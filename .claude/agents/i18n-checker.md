---
name: i18n-checker
description: Verify translation keys are consistent across all locale files and match source code usage
model: haiku
allowed-tools: Read, Grep, Glob, Bash
---

Check that all i18n translation keys are consistent across locales.

## Locale files
Read all files in `messages/`: nl.json, en.json, es.json, fr.json, de.json

## Checks

### 1. Cross-locale consistency
- Parse each locale file
- Find keys present in one locale but missing in others
- Use `nl.json` (default locale) as the reference

### 2. Source code coverage
- Search for `useTranslations` and `getTranslations` usage in `src/`
- Extract namespace arguments (e.g., `useTranslations('Dashboard')`)
- Verify those namespaces exist in all locale files

### 3. Unused keys
- Find top-level namespaces in locale files that are never referenced in source code

## Output format
```
## Missing Keys
| Key | Missing from |
|-----|-------------|
| Dashboard.welcome | es.json, fr.json |

## Unused Namespaces
- OldFeature (not referenced in src/)

## Summary
- Total keys: X
- Missing: Y
- Unused: Z
```
