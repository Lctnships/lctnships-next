-- Align DB schema with code: the app references columns that were missing.
-- projects: code uses owner_id (renamed from user_id)
ALTER TABLE public.projects RENAME COLUMN user_id TO owner_id;

-- reviews: reviewee_id (who is being reviewed) was referenced but never created
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reviewee_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

-- Indexes against the now-correct columns
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_type
  ON public.reviews (reviewee_id, review_type);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id
  ON public.projects (owner_id);
