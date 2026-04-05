---
name: new-api-route
description: Scaffold a new Next.js App Router API route following lctnships conventions (Supabase server client, auth guard, Zod validation, typed errors)
---

# New API Route

Creates a new API route under `src/app/api/<name>/route.ts` consistent with existing routes.

## Conventions in this project

- **Location**: `src/app/api/<resource>/route.ts` or `src/app/api/<resource>/[id]/route.ts`
- **Supabase client**: Use `createClient()` from `@/lib/supabase/server` (cookie-aware, RLS-enforcing). Only use admin client when RLS must be bypassed for legitimate reasons — add a comment explaining why.
- **Auth**: Always call `supabase.auth.getUser()` at the top and return 401 if no user — even for routes that look public.
- **Validation**: Validate request bodies with Zod schemas. Never trust request shape.
- **Errors**: Return `{ error: string }` with appropriate status codes. Never leak Supabase error internals to clients.
- **Rate limiting**: Already applied in `src/middleware.ts` for `/api/*` — do not re-implement.
- **i18n**: Error messages returned to clients are user-facing only if the UI renders them; otherwise keep them in English for logs.

## Template — Collection route (GET list, POST create)

```ts
// src/app/api/<resource>/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateSchema = z.object({
  // define fields
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("<table>")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[<resource>] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("<table>")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("[<resource>] POST error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
```

## Template — Item route (GET/PATCH/DELETE by id)

```ts
// src/app/api/<resource>/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateSchema = z.object({
  // partial fields
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("<table>").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = UpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

  const { data, error } = await supabase.from("<table>").update(parsed.data).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("<table>").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
```

## Checklist before committing
- [ ] RLS policy exists for every operation (SELECT/INSERT/UPDATE/DELETE)
- [ ] Auth check present on every handler
- [ ] Zod schema covers all client-provided fields
- [ ] Errors logged server-side, generic message to client
- [ ] If using admin client: justified with inline comment
- [ ] Added corresponding test in `tests/` if it's a critical path
