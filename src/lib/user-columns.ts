// Columns of public.users that are safe to expose to other users and to
// anonymous visitors. Keep in sync with the column-level grants in
// supabase/migrations/018_users_authenticated_column_revoke.sql — selecting
// anything outside this list (or "*") fails once those grants are active.
export const PUBLIC_USER_COLUMNS =
  "id, full_name, avatar_url, bio, location, user_type, is_verified, created_at, updated_at"
