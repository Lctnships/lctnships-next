# MIN-009 — Movinin Property Search & Filtering

Source paths inspected:
- `~/Desktop/movinin/backend/src/routes/propertyRoutes.ts`
- `~/Desktop/movinin/backend/src/config/propertyRoutes.config.ts`
- `~/Desktop/movinin/backend/src/controllers/propertyController.ts` (lines 838–1033)
- `~/Desktop/movinin/backend/src/models/Property.ts`
- `~/Desktop/movinin/packages/movinin-types/index.ts` (`GetPropertiesPayload`)
- `~/Desktop/movinin/frontend/src/services/PropertyService.ts`
- `~/Desktop/movinin/frontend/src/components/PropertyList.tsx`
- `~/Desktop/movinin/frontend/src/config/env.config.ts`

---

## 1. Search endpoint

| Field | Value |
|---|---|
| **HTTP method** | `POST` |
| **Path** | `/api/frontend-properties/:page/:size` |
| **Route file** | `backend/src/routes/propertyRoutes.ts` line 19 |
| **Auth** | None (public — no `authJwt.verifyToken` middleware) |
| **Controller** | `propertyController.getFrontendProperties` |

The path constants live in `backend/src/config/propertyRoutes.config.ts`:

```ts
getFrontendProperties: '/api/frontend-properties/:page/:size',
getProperties:        '/api/properties/:page/:size',          // admin/agency, auth-protected
getBookingProperties: '/api/booking-properties/:page/:size',  // admin/agency, auth-protected
```

The renter-facing search uses `getFrontendProperties` exclusively.

### Request body (`GetPropertiesPayload`)
From `packages/movinin-types/index.ts` line 407:

```ts
export interface GetPropertiesPayload {
  agencies: string[]          // required — list of agency (User) ObjectIds
  types?: PropertyType[]      // House | Apartment | Townhouse | Plot | Farm | Commercial | Industrial
  rentalTerms?: RentalTerm[]  // Daily | Weekly | Monthly | Yearly
  availability?: Availablity[]
  location?: string           // Location ObjectId (single)
  language?: string
  from?: Date                 // required at runtime — controller throws if missing
  to?: Date                   // required at runtime — controller throws if missing
}
```

URL params `:page` (1-based) and `:size` (page size) drive pagination.

---

## 2. MongoDB query pattern

`getFrontendProperties` builds a single `Property.aggregate([...])` pipeline. Stage by stage:

### Stage 1 — Pre-pipeline location expansion
Before the pipeline, a separate `Location.find` query expands the requested location to include child locations:

```ts
const locIds = await Location.find({
  $or: [
    { _id: location },
    { parentLocation: location },
  ],
}).select('_id').lean()
const locationIds = locIds.map((loc) => loc._id)
```

This is a hierarchical location filter (e.g. select "France" → also include all child cities).

### Stage 2 — `$match` (initial filter)

```ts
const $match = {
  $and: [
    { agency:    { $in: agencies } },     // user-supplied agency list
    { location:  { $in: locationIds } },  // expanded parent + children
    { type:      { $in: types } },        // user-supplied property types
    { rentalTerm:{ $in: rentalTerms } },  // user-supplied rental terms
    { available: true },                  // hard-coded
    { hidden:    false },                 // hard-coded
  ],
}
```

### Stage 3 — `$lookup` agency (User collection)
Joins `Property.agency → User._id`, filtering out blacklisted agencies:

```ts
{ $lookup: {
    from: 'User',
    let: { userId: '$agency' },
    pipeline: [{
      $match: {
        $and: [
          { $expr: { $eq: ['$_id', '$$userId'] } },
          { blacklisted: false },
        ],
      },
    }],
    as: 'agency',
}},
{ $unwind: { path: '$agency', preserveNullAndEmptyArrays: false } },
```

`preserveNullAndEmptyArrays: false` means properties belonging to a blacklisted agency disappear entirely.

### Stage 4 — `$lookup` Bookings for date-overlap exclusion
For each property, fetch `Booking` rows that overlap the requested `from..to` window with status in `[Paid, Reserved, Deposit]`:

```ts
{ $lookup: {
    from: 'Booking',
    let: { propertyId: '$_id' },
    pipeline: [{
      $match: { $expr: { $and: [
        { $eq: ['$property', '$$propertyId'] },
        { $not: [{ $or: [
          { $lt: ['$to',   new Date(from)] },  // booking ends before window
          { $gt: ['$from', new Date(to)] },    // booking starts after window
        ]}]},
        { $in: ['$status', [Paid, Reserved, Deposit]] },
      ]}}
    }],
    as: 'overlappingBookings'
}},
{ $match: {
  $expr: { $or: [
    { $eq: [{ $ifNull: ['$blockOnPay', false] }, false] },  // property doesn't block on pay
    { $eq: [{ $size: '$overlappingBookings' }, 0] }          // OR no overlap
  ]}
}},
```

If `blockOnPay = true` AND there's any overlap, the property is dropped. **Note:** `Location` is *not* `$lookup`-ed in this pipeline (the join is commented out — only the `_id` is returned). The frontend does a separate `LocationService.getLocation()` call when needed.

### Stage 5 — Optional `$addFields` (server-side JS)
When `env.DB_SERVER_SIDE_JAVASCRIPT` is true, MongoDB executes a `$function` (server-side JS) computing `dailyPrice` from `price` + `rentalTerm`. This requires `--enableScripting` on mongod and is gated by env flag.

### Stage 6 — `$facet` for paginated result + total count
Pagination is bundled into one round trip:

```ts
{ $facet: {
    resultData: [{ $sort }, { $skip: (page - 1) * size }, { $limit: size }],
    pageInfo:   [{ $count: 'totalRecords' }],
}}
```

### Stage 7 — `$sort`
Default: `{ name: 1, _id: 1 }`. With server-side JS enabled: `{ dailyPrice: 1, name: 1, _id: 1 }` (cheapest daily price first).

### Collation
Aggregation runs with `{ collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } }` so name sorting is locale-aware and case-insensitive.

---

## 3. Filters — what the frontend can pass

From `frontend/src/services/PropertyService.ts` and `frontend/src/components/PropertyList.tsx`:

| Filter | Field | Source | Notes |
|---|---|---|---|
| Agencies | `agencies: string[]` | URL state | required (empty array allowed but `$in: []` matches nothing) |
| Property type | `types: PropertyType[]` | URL state | House, Apartment, Townhouse, Plot, Farm, Commercial, Industrial |
| Rental term | `rentalTerms: RentalTerm[]` | URL state | Daily, Weekly, Monthly, Yearly |
| Location | `location: string` (single ObjectId) | URL state | expanded server-side via `parentLocation` |
| Date range | `from: Date`, `to: Date` | URL state | both required at runtime; used for booking-overlap exclusion |
| Availability | `availability?: Availablity[]` | type defines it | declared in payload type, **NOT used** in `getFrontendProperties` controller |

**Filters NOT supported on the frontend search:**

- Price range (no `minPrice` / `maxPrice` parameter)
- Bedrooms / bathrooms count
- Amenities (`petsAllowed`, `furnished`, `aircon`) — present on the model, not exposed as search filters
- Free-text keyword (the text index on `name` exists but isn't used by `getFrontendProperties`; it's used by the agency-side `getProperties` which accepts `req.query.s`)
- Square-meter `size`
- `minimumAge`
- Geo / radius / bounding box

---

## 4. Pagination strategy

| Aspect | Value |
|---|---|
| Strategy | **Page-based** — `:page/:size` URL params, `$skip + $limit` |
| 1-based? | Yes (`(page - 1) * size`) |
| Default page size | `15` (`env.PROPERTIES_PAGE_SIZE`, overridable via `VITE_MI_PROPERTIES_PAGE_SIZE`) |
| Total count | Returned via `$facet.pageInfo[0].totalRecords` (single round trip) |
| Frontend rendering | **Hybrid**: `PAGINATION_MODE = CLASSIC` (numbered Pager) on desktop; `INFINITE_SCROLL` on mobile or when `VITE_MI_PAGINATION_MODE=INFINITE_SCROLL` |
| Infinite-scroll trigger | `window.scrollY + window.innerHeight + 40px >= document.body.scrollHeight` → `setPage(page + 1)` |

In infinite-scroll mode the frontend appends new pages to the existing rows array; in classic mode it replaces.

**No cursor-based pagination.** Skip/limit suffers the usual deep-page penalty: at page 100 with size 15 the DB must walk past 1485 documents before returning anything.

---

## 5. Geo-search

**None.** `Property.latitude` and `Property.longitude` exist on the model (`backend/src/models/Property.ts` lines 101–106) but:

- No `2dsphere` or `2d` index is declared.
- No `$geoNear`, `$geoWithin`, `$near`, `$nearSphere`, or `$centerSphere` operator anywhere in the controller.
- Location filtering is **strict ObjectId equality** with one level of parent → child expansion (`parentLocation` self-join in the `Location` collection).

So a renter searching "Paris" gets every property whose `location` field equals the Paris ObjectId or whose location's `parentLocation` is Paris. There's no "within 5 km of these coordinates" capability.

---

## 6. Indexes that support the search

From `backend/src/models/Property.ts` lines 145–156:

```ts
propertySchema.index({ updatedAt: -1, _id: 1 })
propertySchema.index({ agency: 1, type: 1, rentalTerm: 1, available: 1, updatedAt: -1, _id: 1 })  // 6-field compound
propertySchema.index({ type: 1, rentalTerm: 1, available: 1 })
propertySchema.index({ location: 1, available: 1 })
propertySchema.index({ name: 'text' }, { default_language: 'none', language_override: '_none', background: true })
// implicit: agency single-field index from `index: true` on the schema field
```

### Index vs. actual `$match` order

Actual `$match` filter (in declaration order):

```
agency ($in)  →  location ($in)  →  type ($in)  →  rentalTerm ($in)  →  available  →  hidden
```

The 6-field compound `{ agency, type, rentalTerm, available, updatedAt, _id }` is the closest fit but **does not include `location`**. With `location` in the filter, MongoDB will use the compound index for the `agency/type/rentalTerm/available` portion and then post-filter on `location` and `hidden` (or, depending on the planner, may instead pick the `{ location, available }` index). The order of fields in the `$and` array doesn't change index selection — the planner does that — but the index leaves `location` and `hidden` un-indexed against this query.

Additional concerns:

- All four primary filter fields are `$in` arrays. `$in` on a compound prefix is fine for equality, but multiple `$in`s in a row generally cause the planner to expand into multiple index bounds (works, but reduces selectivity gains).
- **No index on `hidden`** — every result is post-filtered.
- **No index on `(location, available, hidden)`** to support the location-first variant.
- **`updatedAt` and `_id` in the compound are dead weight** for this query — the actual sort is `name: 1, _id: 1` (or `dailyPrice: 1, …`), neither of which can use this index. The sort therefore does an in-memory sort of the matched set (acceptable while small, scales poorly).

This is **not** a clean match. The compound exists but the search query's filter shape and sort order don't take full advantage of it.

---

## 7. Caching

**None visible.**

- No Redis client, no in-memory LRU, no `node-cache`, no `lru-cache` import in `propertyController.ts`.
- No HTTP cache headers (`Cache-Control`, `ETag`, `Last-Modified`) set on the response — controller calls `res.json(data)` directly.
- Express sees no caching middleware in the route file.
- The `$facet` round trip runs the full pipeline on every request, including the booking-overlap `$lookup` which touches the `Booking` collection per request.

This is a real scalability gap. With 1000 properties and 100 concurrent searchers, every search re-runs the full aggregate.

---

## Comparison: Movinin vs. lctnships

| Aspect | Movinin | lctnships |
|---|---|---|
| Search endpoint | `POST /api/frontend-properties/:page/:size` (MongoDB aggregation) | `GET /api/studios?...` (Supabase query, query-string driven) |
| Filtering | Server-side via aggregation `$match` + `$in` arrays for agency/type/rentalTerm + parent-location expansion + booking-overlap `$lookup` | Server-side via Supabase chained `.eq("is_published", true)`, `.ilike("city", ...)`, `.eq("type", ...)`, `.gte/.lte("price_per_hour", ...)`, `.contains("amenities", ...)`, optional `.or()` text search |
| Frontend filters exposed | agencies, types, rentalTerms, location, from, to | search keyword, city, type, minPrice, maxPrice, date, amenities, hostId, sortBy, sortOrder |
| Date conflict handling | `$lookup` Booking + size==0 check (single round trip, when `blockOnPay`) | Two-query: fetch studios, then fetch overlapping bookings for that day, then `.filter(s => !bookedIds.has(s.id))` in JS |
| Pagination | Page-based skip/limit, default size 15, `$facet` returns rows + count in one shot | Page-based `range(from, to)`, default size 12, `count: "exact"` via Supabase `.select(..., { count: "exact" })` |
| Infinite scroll | Yes (mobile or env-flagged); classic Pager on desktop | Not in `/api/studios` (caller's responsibility) |
| Geo-search | None — ObjectId match + parent expansion only (lat/lng on model, unused) | None visible — city `ilike` only |
| Sorting | `{ name, _id }` default; `{ dailyPrice, name, _id }` when `DB_SERVER_SIDE_JAVASCRIPT=true` | Configurable via `sortBy` + `sortOrder` query params (default `created_at desc`) |
| Caching | None visible | None visible |
| Index strategy | 6-field compound `{ agency, type, rentalTerm, available, updatedAt, _id }` — partial fit (missing `location`, `hidden`; sort key not indexed) | Migration 006 only indexes `bookings`, `payouts`, `projects`, `reviews` — **no studio search indexes**. The studios search relies on default Supabase btree-on-PK only |
| Auth on search | Public (no JWT) | Public (no auth guard in `GET /api/studios`) |
| Hierarchical location | Yes — `parentLocation` self-join expands to children | No — flat `city` ilike |

### Notable differences worth flagging

1. **Movinin's booking-overlap check is in the same aggregation** (one round trip), while lctnships does a follow-up JS filter. Movinin's approach scales better — it leans on Mongo to narrow before hydration; lctnships pulls all matching studios then filters in Node.
2. **Movinin's frontend exposes fewer filters** (no price, bedrooms, amenities) despite the model having those fields. lctnships exposes a richer surface (price range, amenities array contains).
3. **Neither has geo / radius search.** Both could be a candidate for a follow-up improvement (`2dsphere` for Movinin, PostGIS or `earthdistance` for lctnships).
4. **Neither caches.** Same gap on both sides.
5. **lctnships has zero search-supporting indexes on `studios`** — no compound on `(is_published, city, type, price_per_hour)`. Migration 006 covers dashboard queries only. Worth verifying with `pg_stats` whether the planner falls back to a sequential scan once the table grows past a few hundred rows.
