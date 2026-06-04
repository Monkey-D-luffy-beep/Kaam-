create table if not exists public.contact_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

create policy "Anyone can submit contact"
  on public.contact_requests for insert
  with check (true);

create policy "Service role reads contacts"
  on public.contact_requests for select
  using (auth.role() = 'service_role');
