---
name: create-migration
description: Create a new Supabase SQL migration file with proper sequential numbering
disable-model-invocation: true
allowed-tools: Read, Write, Bash, Glob
---

Create a Supabase migration for: $ARGUMENTS

## Current migrations
!`ls supabase/migrations/`

## Rules
1. Determine the next migration number by incrementing the highest existing prefix (e.g., 005 → 006)
2. Create file: `supabase/migrations/{NNN}_{descriptive_snake_case_name}.sql`
3. Write idempotent SQL — use `IF NOT EXISTS`, `IF EXISTS`, `OR REPLACE` where applicable
4. Include both the migration and a comment header with description
5. For table changes, consider impact on existing RLS policies
6. Reference `src/types/database.types.ts` for current schema context
