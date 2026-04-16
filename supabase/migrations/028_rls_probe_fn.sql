CREATE OR REPLACE FUNCTION public.rls_state()
RETURNS TABLE (table_name text, rls_enabled boolean, policy_count int)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.relname::text,
         c.relrowsecurity,
         (SELECT count(*)::int FROM pg_policy p WHERE p.polrelid = c.oid)
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY c.relname;
$$;
REVOKE ALL ON FUNCTION public.rls_state() FROM public;
GRANT EXECUTE ON FUNCTION public.rls_state() TO authenticated, service_role;
