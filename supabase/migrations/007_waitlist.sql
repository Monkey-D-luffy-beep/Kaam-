-- Waitlist / newsletter sign-ups
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text,                          -- e.g. 'landing_footer', 'hero_cta'
  created_at  timestamptz not null default now()
);

-- No auth needed; allow anonymous inserts
alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- Only service role / authenticated can read
create policy "Service role can read waitlist"
  on public.waitlist for select
  using (auth.role() = 'service_role');

-- Index for dedup lookups
create index if not exists waitlist_email_idx on public.waitlist (email);
