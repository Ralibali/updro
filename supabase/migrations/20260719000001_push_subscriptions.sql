-- Push-prenumerationer för web push (PWA). En rad per enhet/webbläsare.
-- Ägaren hanterar sina egna prenumerationer; edge-funktionen send-push
-- läser via service role när notiser ska skickas.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users can read their own push subscriptions"
on public.push_subscriptions for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own push subscriptions"
on public.push_subscriptions for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions"
on public.push_subscriptions for update to authenticated
using (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
on public.push_subscriptions for delete to authenticated
using (auth.uid() = user_id);
