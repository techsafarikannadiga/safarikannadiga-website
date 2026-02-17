-- Create a table to track site statistics
create table site_stats (
  id text primary key,
  visit_count bigint default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert the initial counter row
insert into site_stats (id, visit_count)
values ('main', 0)
on conflict (id) do nothing;

-- Set up Row Level Security (RLS)
alter table site_stats enable row level security;

-- Allow public read access (so everyone can see the count)
create policy "Allow public read access"
  on site_stats
  for select
  using (true);

-- Allow anonymous updates (incrementing) - optionally restrict this if using an API route with admin key
-- Since we are using an API route with the SERVICE_ROLE key to increment, we don't strictly need an RLS policy for UPDATE for public.
-- In fact, it's safer NOT to allow public updates directly. 
-- We will only allow READ. Updates must happen via the server-side API.
