-- Infinite recursion (42P17) between projects and project_members RLS:
-- the projects SELECT policy does EXISTS(SELECT FROM project_members ...),
-- and the project_members policy does EXISTS(SELECT FROM projects ...) —
-- each triggers the other's policy. Result: every project page 404'd.
-- Break the cycle with SECURITY DEFINER helpers (owned by postgres, table
-- owner → bypass RLS in the subquery). Same pattern as the
-- conversation_participants fix.

CREATE OR REPLACE FUNCTION public.is_project_owner(p_project_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_project_id AND owner_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_project_owner(uuid, uuid)  TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_project_member(uuid, uuid) TO authenticated, anon, service_role;

-- projects: owner OR member, via the definer helper (no direct FROM project_members)
DROP POLICY IF EXISTS "Project owners and members can view" ON public.projects;
CREATE POLICY "Project owners and members can view"
  ON public.projects
  FOR SELECT
  USING (owner_id = auth.uid() OR public.is_project_member(id, auth.uid()));

-- project_members: owner manages, via the definer helper (no direct FROM projects)
DROP POLICY IF EXISTS "Owners manage project members" ON public.project_members;
CREATE POLICY "Owners manage project members"
  ON public.project_members
  FOR ALL
  USING (public.is_project_owner(project_id, auth.uid()))
  WITH CHECK (public.is_project_owner(project_id, auth.uid()));
