-- Run once in Supabase → SQL Editor
-- Creates course_reviews table + RLS for the Netlify review panel

create table if not exists public.course_reviews (
  id bigint generated always as identity primary key,
  course_id text not null,
  slide_index int not null,
  scene_id text not null,
  slide_title text,
  section text,
  progress text,
  stage_excerpt text,
  page_title text,
  created_at_client timestamptz,
  user_agent text,
  reviewer_name text,
  note text not null,
  inserted_at timestamptz not null default now()
);

-- If you created the table before slide_title / reviewer_name were added:
alter table public.course_reviews
  add column if not exists slide_title text,
  add column if not exists reviewer_name text;

alter table public.course_reviews enable row level security;

drop policy if exists "anon_insert_course_reviews" on public.course_reviews;
create policy "anon_insert_course_reviews"
  on public.course_reviews
  for insert
  to anon
  with check (true);

drop policy if exists "anon_select_course_reviews" on public.course_reviews;
create policy "anon_select_course_reviews"
  on public.course_reviews
  for select
  to anon
  using (true);

drop policy if exists "anon_update_course_reviews" on public.course_reviews;
create policy "anon_update_course_reviews"
  on public.course_reviews
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "anon_delete_course_reviews" on public.course_reviews;
create policy "anon_delete_course_reviews"
  on public.course_reviews
  for delete
  to anon
  using (true);
