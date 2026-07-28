-- =====================================================================
-- MASHAER JEWELLERY — schema upgrade + seed (UUID remap)
-- Run this ONCE in Supabase → SQL Editor → New query → Run.
--
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / ON CONFLICT),
-- and it NEVER touches your products — see section 4.
--
-- What this file is:
--   * an UPGRADE script for an existing database (functions, triggers, RLS
--     policies, the categories table, the memory + order RPCs), plus
--   * a minimal seed of categories and collections so the storefront renders.
--
-- What this file is NOT:
--   * It cannot build a database from nothing. It runs statements like
--     `alter table public.collections add column …` against tables it never
--     creates, so on an empty project it fails immediately. The base DDL for
--     products/orders/memories/profiles/etc. still exists ONLY inside the live
--     Supabase project. That is finding C4, and it is still open — the fix is
--     `supabase db dump` into supabase/migrations/0001_baseline.sql, which
--     needs Docker or pg_dump installed. See supabase/migrations/README.md.
--   * It does not seed products. Those are yours, managed in Admin → Products.
--
-- For an EXISTING database, prefer the numbered files in supabase/migrations/.
-- Add new changes there, not here.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. SCHEMA UPGRADE (brings an already-created DB up to the fixed schema)
-- ---------------------------------------------------------------------

create extension if not exists pgcrypto;

-- Categories table (was missing entirely)
create table if not exists public.categories (
  id text primary key,           -- e.g. "cat-rings" (matches old seed ids)
  slug text unique not null,     -- e.g. "rings"
  name jsonb not null,
  description jsonb,
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Give collections a stable human key so products can be remapped by it
alter table public.collections add column if not exists slug text;
create unique index if not exists collections_slug_key
  on public.collections (slug);

-- Link products.category_id → categories(id)
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_category_id_fkey'
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id) references public.categories(id)
      on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 1b. CASCADE CLEANUP — deleting an account removes ALL of its data
--     and deleting an order removes its items + memories. This avoids
--     orphaned rows piling up unused storage.
--
--     auth.users ─┬─cascade─> profiles
--                 ├─cascade─> addresses
--                 ├─cascade─> wishlist
--                 └─cascade─> orders ─┬─cascade─> order_items
--                                     └─cascade─> memories
--
--     We DROP + re-ADD the two FKs that were originally "set null".
-- ---------------------------------------------------------------------
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'orders_user_id_fkey') then
    alter table public.orders drop constraint orders_user_id_fkey;
  end if;
  alter table public.orders
    add constraint orders_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
end $$;

do $$ begin
  if exists (select 1 from pg_constraint where conname = 'memories_order_id_fkey') then
    alter table public.memories drop constraint memories_order_id_fkey;
  end if;
  alter table public.memories
    add constraint memories_order_id_fkey
    foreign key (order_id) references public.orders(id) on delete cascade;
end $$;

-- Orders: QR token columns (memory tokens minted at checkout)
alter table public.orders add column if not exists qr_tokens text[] not null default '{}';
alter table public.orders add column if not exists qr_token_labels text[] not null default '{}';
alter table public.orders add column if not exists qr_token_product_ids text[] not null default '{}';

-- Block admin self-promotion (privilege escalation fix)
create or replace function public.guard_is_admin()
returns trigger language plpgsql security definer as $$
begin
  -- auth.uid() is null only on trusted paths (SQL editor / service role);
  -- every API request carries a uid and must come from an existing admin.
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin can change admin status';
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_is_admin on public.profiles;
create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row execute function public.guard_is_admin();

-- Admin allowlist: these accounts are admins — promoted now if they already
-- signed up, and auto-promoted the moment they sign up later.
create or replace function public.admin_allowlist()
returns text[] language sql immutable as $$
  select array['nourmorad312@gmail.com', 'chahinabdulaziz@gmail.com'];
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    lower(new.email) = any (public.admin_allowlist())
  );
  return new;
end $$;

update public.profiles p set is_admin = true
from auth.users u
where u.id = p.id
  and lower(u.email) = any (public.admin_allowlist())
  and not p.is_admin;

-- Categories RLS
alter table public.categories enable row level security;
drop policy if exists "anyone reads categories" on public.categories;
create policy "anyone reads categories" on public.categories
  for select using (true);
drop policy if exists "admins write categories" on public.categories;
create policy "admins write categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Memories: stop public table-wide reads (data-leak fix)
drop policy if exists "anyone with token reads memory" on public.memories;
drop policy if exists "owner or admin reads memory" on public.memories;
create policy "owner or admin reads memory" on public.memories
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Public QR card: report that a memory EXISTS for this token, plus the linked
-- product (catalog data, not personal). It deliberately does NOT return the
-- title / message / photos — those are private and only handed out by
-- unlock_memory() after a correct PIN (or by RLS to the order owner / admin).
-- DROP first: an older deploy returned title/message/photos, and Postgres
-- can't change a function's OUT-column set via CREATE OR REPLACE.
drop function if exists public.get_memory(text);
create or replace function public.get_memory(p_token text)
returns table (
  token text, order_id text, product_id uuid, product_label text,
  created_at timestamptz, updated_at timestamptz
)
language sql security definer stable as $$
  select token, order_id, product_id, product_label,
         created_at, updated_at
  from public.memories where token = p_token;
$$;

-- Public QR card: return the FULL memory (title/message/photos) only after the
-- PIN checks out. This is the single PIN-gated read path; it enforces the
-- 5-try / 15-min lockout itself.
--
-- It RETURNS a status row instead of raising on a wrong/locked PIN. That is
-- deliberate: PostgREST wraps each RPC in one transaction, so a RAISE would
-- roll the whole call back — including the failed-attempt UPDATE we just made,
-- meaning the counter could never accumulate and the lockout would never fire.
-- Returning a row commits the counter and hands the client structured feedback
--   status = 'ok'     → content columns are populated
--   status = 'wrong'  → attempts_left = tries remaining before lockout
--   status = 'locked' → minutes_left  = minutes until the lock expires
-- The DROP is required because the OUT-column set changed (added status cols).
drop function if exists public.unlock_memory(text, text);
create or replace function public.unlock_memory(p_token text, p_pin text)
returns table (
  status text, attempts_left int, minutes_left int,
  token text, order_id text, product_id uuid, product_label text,
  title text, message text, photos text[],
  created_at timestamptz, updated_at timestamptz
)
language plpgsql security definer as $$
declare
  v_locked timestamptz;
  v_attempts int;
  v_ok boolean;
  v_new int;
begin
  select pin_locked_until, failed_pin_attempts
    into v_locked, v_attempts
  from public.memories where token = p_token;

  -- Unknown token: report as a wrong PIN (get_memory already governs existence).
  if not found then
    return query select 'wrong'::text, 0, 0,
      null::text, null::text, null::uuid, null::text,
      null::text, null::text, null::text[],
      null::timestamptz, null::timestamptz;
    return;
  end if;

  -- Still inside the lock window: reject without touching the hash.
  if v_locked is not null and v_locked > now() then
    return query select 'locked'::text, 0,
      greatest(1, ceil(extract(epoch from (v_locked - now())) / 60))::int,
      null::text, null::text, null::uuid, null::text,
      null::text, null::text, null::text[],
      null::timestamptz, null::timestamptz;
    return;
  end if;

  -- Lock window has passed: clear the stale counter for a fresh set of tries.
  if v_locked is not null then
    update public.memories
      set failed_pin_attempts = 0, pin_locked_until = null
      where token = p_token;
    v_attempts := 0;
  end if;

  select pin_hash = crypt(p_pin, pin_hash) into v_ok
  from public.memories where token = p_token;

  if v_ok then
    update public.memories
      set failed_pin_attempts = 0, pin_locked_until = null
      where token = p_token;
    return query
      select 'ok'::text, 0, 0,
             m.token, m.order_id, m.product_id, m.product_label,
             m.title, m.message, m.photos, m.created_at, m.updated_at
      from public.memories m where m.token = p_token;
  else
    v_new := v_attempts + 1;
    update public.memories
      set failed_pin_attempts = v_new,
          pin_locked_until = case when v_new >= 5
                                  then now() + interval '15 minutes' end
      where token = p_token;
    if v_new >= 5 then
      return query select 'locked'::text, 0, 15,
        null::text, null::text, null::uuid, null::text,
        null::text, null::text, null::text[],
        null::timestamptz, null::timestamptz;
    else
      return query select 'wrong'::text, (5 - v_new), 0,
        null::text, null::text, null::uuid, null::text,
        null::text, null::text, null::text[],
        null::timestamptz, null::timestamptz;
    end if;
  end if;
end $$;

-- Brute-force protection: a 4-digit PIN only has 10,000 combinations, so
-- 5 wrong attempts lock the memory for 15 minutes.
alter table public.memories
  add column if not exists failed_pin_attempts int not null default 0;
alter table public.memories
  add column if not exists pin_locked_until timestamptz;

-- Verify a PIN server-side (pin_hash never leaves the database), recording the
-- attempt and enforcing the lockout — WITHOUT raising. Same reasoning as
-- unlock_memory above: a RAISE rolls back the failed-attempt UPDATE, so the
-- counter could never accumulate. Returns one status row:
--   status = 'ok'     → the PIN matched; the counter has been reset
--   status = 'wrong'  → attempts_left = tries remaining before lockout
--   status = 'locked' → minutes_left  = minutes until the lock expires
create or replace function public.check_memory_pin(p_token text, p_pin text)
returns table (status text, attempts_left int, minutes_left int)
language plpgsql security definer as $$
declare
  v_locked timestamptz;
  v_attempts int;
  v_ok boolean;
  v_new int;
begin
  select pin_locked_until, failed_pin_attempts
    into v_locked, v_attempts
  from public.memories where token = p_token;

  if not found then
    return query select 'wrong'::text, 0, 0;
    return;
  end if;

  if v_locked is not null and v_locked > now() then
    return query select 'locked'::text, 0,
      greatest(1, ceil(extract(epoch from (v_locked - now())) / 60))::int;
    return;
  end if;

  -- Lock window has passed: clear the stale counter so the user gets a fresh
  -- set of 5 attempts instead of being re-locked on the very next miss.
  if v_locked is not null then
    update public.memories
      set failed_pin_attempts = 0, pin_locked_until = null
      where token = p_token;
    v_attempts := 0;
  end if;

  select pin_hash = crypt(p_pin, pin_hash) into v_ok
  from public.memories where token = p_token;

  if v_ok then
    update public.memories
      set failed_pin_attempts = 0, pin_locked_until = null
      where token = p_token;
    return query select 'ok'::text, 0, 0;
  else
    v_new := coalesce(v_attempts, 0) + 1;
    update public.memories
      set failed_pin_attempts = v_new,
          pin_locked_until = case when v_new >= 5
                                  then now() + interval '15 minutes' end
      where token = p_token;
    if v_new >= 5 then
      return query select 'locked'::text, 0, 15;
    else
      return query select 'wrong'::text, (5 - v_new), 0;
    end if;
  end if;
end $$;

-- Boolean wrapper kept for compatibility. No longer raises on the locked
-- branch (which used to roll back its own counter-clearing update).
create or replace function public.verify_memory_pin(p_token text, p_pin text)
returns boolean
language plpgsql security definer as $$
declare
  v_status text;
begin
  select c.status into v_status
  from public.check_memory_pin(p_token, p_pin) c;
  return v_status = 'ok';
end $$;

-- Create/update a memory. The QR token is the capability: anyone holding a
-- token printed on a real order card can do the FIRST setup (and sets a PIN);
-- later edits require that PIN (admins bypass). Hashing stays server-side.
-- Returns a status row rather than raising on a wrong/locked PIN — same
-- transaction-rollback reasoning as unlock_memory. The DROP is required because
-- the return type changed from void.
drop function if exists public.save_memory(text, text, uuid, text, text, text, text, text[]);

create or replace function public.save_memory(
  p_token text, p_order_id text, p_product_id uuid, p_product_label text,
  p_pin text, p_title text, p_message text, p_photos text[]
)
returns table (status text, attempts_left int, minutes_left int)
language plpgsql security definer as $$
declare
  v_exists boolean;
  v_order_id text;
  v_idx int;
  v_prod_text text;
  v_label text;
  v_check record;
begin
  select exists(select 1 from public.memories where token = p_token)
    into v_exists;

  if v_exists then
    -- Editing an existing memory requires the correct PIN, UNLESS the caller is
    -- the order owner or an admin (they manage their own keepsakes freely). For
    -- everyone else (a public token holder) check_memory_pin() also enforces
    -- the failed-attempt lockout.
    if not (
      public.is_admin() or exists (
        select 1 from public.orders o
        join public.memories m on m.order_id = o.id
        where m.token = p_token and o.user_id = auth.uid()
      )
    ) then
      select * into v_check
      from public.check_memory_pin(p_token, coalesce(p_pin, ''));

      -- Return the failure as DATA. Raising here would roll back the
      -- failed-attempt increment check_memory_pin just wrote — which is exactly
      -- how the lockout was defeated on this path.
      if v_check.status <> 'ok' then
        return query select v_check.status, v_check.attempts_left, v_check.minutes_left;
        return;
      end if;
    end if;
    update public.memories set
      product_id    = coalesce(p_product_id, product_id),
      product_label = coalesce(p_product_label, product_label),
      title         = coalesce(p_title, ''),
      message       = coalesce(p_message, ''),
      photos        = coalesce(p_photos, '{}'),
      updated_at    = now()
    where token = p_token;
  else
    -- First-time setup: the token must be a real QR token minted on an order.
    select o.id, array_position(o.qr_tokens, p_token)
      into v_order_id, v_idx
    from public.orders o
    where p_token = any(o.qr_tokens)
    limit 1;

    if v_order_id is null and not public.is_admin() then
      raise exception 'Unknown memory token';
    end if;
    if p_pin is null or p_pin !~ '^\d{4}$' then
      raise exception 'A 4-digit PIN is required';
    end if;

    -- Derive product id / label from the order's token arrays when not supplied.
    if v_order_id is not null and v_idx is not null then
      select qr_token_product_ids[v_idx], qr_token_labels[v_idx]
        into v_prod_text, v_label
      from public.orders where id = v_order_id;
    end if;

    insert into public.memories
      (token, order_id, product_id, product_label,
       pin_hash, title, message, photos)
    values (
      p_token,
      coalesce(p_order_id, v_order_id),
      coalesce(
        p_product_id,
        case when v_prod_text ~ '^[0-9a-fA-F-]{36}$'
             then v_prod_text::uuid else null end
      ),
      coalesce(p_product_label, v_label),
      crypt(p_pin, gen_salt('bf')),
      coalesce(p_title, ''), coalesce(p_message, ''), coalesce(p_photos, '{}')
    );
  end if;

  return query select 'ok'::text, 0, 0;
end $$;

-- Admins can delete any memory (cleaves no orphaned data behind).
drop policy if exists "admins delete memories" on public.memories;
create policy "admins delete memories" on public.memories
  for delete using (public.is_admin());

-- Admin-only: reset a memory's PIN without knowing the old one.
create or replace function public.admin_reset_memory_pin(p_token text, p_pin text)
returns void
language plpgsql security definer as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_pin is null or p_pin !~ '^\d{4}$' then
    raise exception 'A 4-digit PIN is required';
  end if;
  update public.memories
    set pin_hash = crypt(p_pin, gen_salt('bf')),
        failed_pin_attempts = 0, pin_locked_until = null,
        updated_at = now()
    where token = p_token;
  if not found then
    raise exception 'Unknown memory token';
  end if;
end $$;

-- Place an order atomically. SECURITY: the client sends ONLY the cart lines,
-- the address and the QR choice. Every price is validated against the live
-- catalog, subtotal/shipping/total are recomputed server-side, the status is
-- forced to 'pending' (no payment is captured yet), and the order id plus every
-- QR token are MINTED HERE — the browser never chooses a security-relevant
-- identifier (H10). Order + items are inserted in ONE transaction so a failure
-- can never leave a half-order.
--
-- Drop the old client-trusting signature first: Postgres OVERLOADS on argument
-- list, so without this an upgraded database would keep both versions and the
-- insecure one would stay callable.
drop function if exists public.place_order(
  text, text, text, jsonb, qr_choice, text[], text[], text[], jsonb, payment_method
);

-- ---------------------------------------------------------------------
-- mint_qr_token — cryptographically random, ambiguity-free QR token.
--
-- Alphabet matches generateToken() in src/lib/utils.ts: no 0/o/1/l/i, because
-- these get read off a printed card by hand.
--
-- Uses REJECTION SAMPLING rather than `byte % 31`. 256 is not divisible by 31,
-- so a plain modulo over-represents the first eight characters (this is finding
-- L8, which the client-side generator still has). 248 = 31 * 8, so any byte
-- from 248-255 is discarded and redrawn.
-- ---------------------------------------------------------------------
create or replace function public.mint_qr_token(p_len int default 8)
returns text
language plpgsql volatile as $$
declare
  v_chars constant text := 'abcdefghjkmnpqrstuvwxyz23456789';  -- 31 chars
  v_out text := '';
  v_byte int;
begin
  while char_length(v_out) < p_len loop
    v_byte := get_byte(gen_random_bytes(1), 0);
    -- Discard the biased tail so every character is equally likely.
    if v_byte < 248 then
      v_out := v_out || substr(v_chars, (v_byte % 31) + 1, 1);
    end if;
  end loop;
  return v_out;
end $$;

-- ---------------------------------------------------------------------
-- place_order — the client now sends only the cart, the address, the QR choice
-- and its display locale. Ids and tokens are minted here.
-- ---------------------------------------------------------------------
create or replace function public.place_order(
  p_customer_name text,
  p_email text,
  p_items jsonb,                -- [{product_id,name,qty,price,variation_label}]
  p_qr_choice qr_choice,
  p_shipping_address jsonb,
  p_payment_method payment_method,
  p_locale text default 'ar'    -- language for the generated token labels
)
returns text
language plpgsql security definer as $$
declare
  v_user uuid := auth.uid();
  v_item jsonb;
  v_pid uuid;
  v_qty int;
  v_price numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_shipping numeric(10,2);
  v_emirate text;
  v_rate_key text;
  v_rates jsonb;
  v_id text;
  v_tokens text[] := '{}';
  v_labels text[] := '{}';
  v_prod_ids text[] := '{}';
  v_token text;
  v_locale text := case when p_locale = 'en' then 'en' else 'ar' end;
  v_base text;
  v_variation text;
  v_label text;
  v_n int;
  v_tries int;
begin
  if v_user is null then
    raise exception 'Sign in to place an order';
  end if;
  if p_customer_name is null or char_length(btrim(p_customer_name)) = 0
     or char_length(p_customer_name) > 120 then
    raise exception 'Bad customer name';
  end if;
  if p_email is null or char_length(p_email) > 255 then
    raise exception 'Bad email';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order has no items';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many line items';
  end if;

  -- Validate every line against the catalog: the product must exist and be
  -- active, and the unit price must be the base price or one of the
  -- variation price overrides. The client can never invent a price.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid   := (v_item->>'product_id')::uuid;
    v_qty   := (v_item->>'qty')::int;
    v_price := (v_item->>'price')::numeric;
    if v_qty is null or v_qty < 1 or v_qty > 50 then
      raise exception 'Bad quantity';
    end if;
    if not exists (
      select 1 from public.products p
      where p.id = v_pid and p.is_active
        and (
          p.price = v_price
          or exists (
            select 1
            from jsonb_array_elements(coalesce(p.variations, '[]'::jsonb)) v
            where (v->>'priceOverride')::numeric = v_price
          )
        )
    ) then
      raise exception 'Item price does not match the catalog';
    end if;
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  -- --------------------------------------------------------------
  -- Shipping (see migration 0005 for the unknown-emirate reasoning)
  -- --------------------------------------------------------------
  select coalesce(data->'shipping', '{}'::jsonb) into v_rates
  from public.admin_settings where id = 1;
  v_rates := '{"dubai":0,"abuDhabi":15,"sharjah":10,"ajman":20,"ummAlQuwain":25,"rasAlKhaimah":25,"fujairah":25}'::jsonb
             || coalesce(v_rates, '{}'::jsonb);
  v_emirate := lower(coalesce(p_shipping_address->>'emirate', ''));
  v_rate_key :=
    case
      when v_emirate like '%dubai%'          or v_emirate like '%دبي%'          then 'dubai'
      when v_emirate like '%abudhabi%'       or v_emirate like '%abu dhabi%'
        or v_emirate like '%أبوظبي%'          or v_emirate like '%أبو ظبي%'       then 'abuDhabi'
      when v_emirate like '%sharjah%'        or v_emirate like '%الشارقة%'      then 'sharjah'
      when v_emirate like '%ajman%'          or v_emirate like '%عجمان%'        then 'ajman'
      when v_emirate like '%ummalquwain%'    or v_emirate like '%umm al quwain%'
        or v_emirate like '%أم القيوين%'                                        then 'ummAlQuwain'
      when v_emirate like '%rasalkhaimah%'   or v_emirate like '%ras al khaimah%'
        or v_emirate like '%رأس الخيمة%'                                        then 'rasAlKhaimah'
      when v_emirate like '%fujairah%'       or v_emirate like '%الفجيرة%'      then 'fujairah'
      else null
    end;
  if v_rate_key is null then
    raise exception 'Unknown emirate: %', coalesce(p_shipping_address->>'emirate', '(missing)');
  end if;
  v_shipping := greatest(coalesce((v_rates->>v_rate_key)::numeric, 0), 0);

  -- --------------------------------------------------------------
  -- Mint the order id. Retry on the (vanishingly unlikely) collision
  -- instead of surfacing a primary-key violation to the customer.
  -- --------------------------------------------------------------
  v_tries := 0;
  loop
    v_id := 'HK-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
    exit when not exists (select 1 from public.orders o where o.id = v_id);
    v_tries := v_tries + 1;
    if v_tries > 10 then
      raise exception 'Could not allocate an order id';
    end if;
  end loop;

  -- --------------------------------------------------------------
  -- Mint QR tokens from the VALIDATED line items — never from client input.
  -- per_order → exactly one token for the whole order.
  -- per_piece → exactly one token per unit purchased.
  -- --------------------------------------------------------------
  if p_qr_choice = 'per_order' then
    v_tokens   := array[public.mint_qr_token()];
    v_labels   := array[case when v_locale = 'en' then 'All Items' else 'جميع المنتجات' end];
    v_prod_ids := array['all'];
  else
    for v_item in select * from jsonb_array_elements(p_items) loop
      v_qty  := (v_item->>'qty')::int;
      v_base := coalesce(v_item->'name'->>v_locale, v_item->'name'->>'en', '');
      v_variation := v_item->'variation_label'->>v_locale;

      for v_n in 1..v_qty loop
        -- Reject a duplicate against live orders and existing memories.
        loop
          v_token := public.mint_qr_token();
          exit when not exists (
            select 1 from public.orders o where v_token = any(o.qr_tokens)
          ) and not exists (
            select 1 from public.memories m where m.token = v_token
          ) and not (v_token = any(v_tokens))
          -- "demo" is a reserved token: /memory/demo renders a fixed showcase
          -- page, so a real memory must never be able to claim it (L9).
          and v_token <> 'demo';
        end loop;

        v_label := v_base
                || case when v_variation is not null then ' · ' || v_variation else '' end
                || case when v_qty > 1 then ' #' || v_n else '' end;

        v_tokens   := v_tokens   || v_token;
        v_labels   := v_labels   || v_label;
        v_prod_ids := v_prod_ids || (v_item->>'product_id');
      end loop;
    end loop;
  end if;

  insert into public.orders
    (id, user_id, customer_name, email, subtotal, shipping, total, status,
     qr_choice, qr_tokens, qr_token_labels, qr_token_product_ids,
     shipping_address, payment_method)
  values
    (v_id, v_user, btrim(p_customer_name), p_email, v_subtotal, v_shipping,
     v_subtotal + v_shipping, 'pending', p_qr_choice,
     v_tokens, v_labels, v_prod_ids, p_shipping_address, p_payment_method);

  insert into public.order_items (order_id, product_id, name, qty, price, variation_label)
  select v_id,
         (i->>'product_id')::uuid,
         i->'name',
         (i->>'qty')::int,
         (i->>'price')::numeric,
         nullif(i->'variation_label', 'null'::jsonb)
  from jsonb_array_elements(p_items) i;

  return v_id;
end $$;

-- ---------------------------------------------------------------------
-- 1c. POLICY HARDENING — close a direct-insert bypass + drop dead policies
--
--  * orders / order_items: an earlier schema script granted clients a direct
--    INSERT policy (WITH CHECK auth.uid() = user_id). That let a signed-in
--    client insert an order row with an arbitrary total/status, sidestepping
--    place_order()'s price validation. place_order() is SECURITY DEFINER and
--    bypasses RLS, so checkout keeps working without these policies.
--  * memory-photos owner policies keyed on split_part(name,'/',1) = orders.id,
--    but files live under "<token>/<uuid>", so the first segment is the TOKEN,
--    never an order id — the policies could never match. Uploads/deletes use the
--    service role and reads use the public URL, so dropping them changes nothing
--    at runtime. The correct "admins delete memory photos" policy is kept.
-- ---------------------------------------------------------------------
drop policy if exists "users insert own orders"     on public.orders;
drop policy if exists "insert items for own orders"  on public.order_items;
drop policy if exists "owner reads memory photos"    on storage.objects;
drop policy if exists "owner uploads memory photos"  on storage.objects;
drop policy if exists "owner deletes memory photos"  on storage.objects;

-- Memory photos are served by their public URL (getPublicUrl in the upload
-- route), which only resolves when the bucket itself is public. Codify that here
-- so a fresh or redeployed environment doesn't need a manual dashboard toggle to
-- make uploaded photos viewable — otherwise every memory image 404/403s until
-- someone flips the bucket by hand. The unguessable "<token>/<uuid>.jpg" path is
-- the only capability to a photo, so a public bucket exposes nothing browsable.
insert into storage.buckets (id, name, public)
  values ('memory-photos', 'memory-photos', true)
  on conflict (id) do update set public = true;

-- ---------------------------------------------------------------------
-- 2. SEED — CATEGORIES (string ids preserved)
-- ---------------------------------------------------------------------
insert into public.categories (id, slug, name, description, sort_order) values
  ('cat-rings',     'rings',
   '{"ar":"خواتم","en":"Rings"}'::jsonb,
   '{"ar":"خواتم بتصاميم رقيقة","en":"Delicate rings, made to be cherished"}'::jsonb, 0),
  ('cat-necklaces', 'necklaces',
   '{"ar":"قلائد","en":"Necklaces"}'::jsonb,
   '{"ar":"قلائد تحمل لحظاتك المميزة","en":"Necklaces that hold your moments"}'::jsonb, 1),
  ('cat-bracelets', 'bracelets',
   '{"ar":"أساور","en":"Bracelets"}'::jsonb,
   '{"ar":"أساور أنيقة لكل المناسبات","en":"Elegant bracelets for every moment"}'::jsonb, 2),
  ('cat-earrings',  'earrings',
   '{"ar":"أقراط","en":"Earrings"}'::jsonb,
   '{"ar":"أقراط بلمسة هادئة","en":"Earrings with a quiet touch"}'::jsonb, 3),
  ('cat-baby',      'baby',
   '{"ar":"مجوهرات الأطفال","en":"Baby Pieces"}'::jsonb,
   '{"ar":"أولى المجوهرات للحظات الأولى","en":"First pieces for first moments"}'::jsonb, 4)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name,
  description = excluded.description, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------
-- 3. SEED — COLLECTIONS (new UUID ids, keyed by slug for remap)
-- ---------------------------------------------------------------------
insert into public.collections (slug, name, description, tone, is_active, sort_order) values
  ('everyday',
   '{"ar":"اليومية","en":"Everyday"}'::jsonb,
   '{"ar":"قطع رقيقة ترافقك يوميًا","en":"Pieces to wear every day"}'::jsonb,
   '#e8dfcc', true, 0),
  ('celebration',
   '{"ar":"المناسبات","en":"Celebration"}'::jsonb,
   '{"ar":"للحظات التي تستحق التألق","en":"For moments that deserve to shine"}'::jsonb,
   '#f0e3d0', true, 1),
  ('heirloom',
   '{"ar":"للتوريث","en":"Heirloom"}'::jsonb,
   '{"ar":"قطع تُورث جيلًا بعد جيل","en":"Made to be passed down"}'::jsonb,
   '#dfd2ba', true, 2),
  ('baby',
   '{"ar":"البدايات","en":"Beginnings"}'::jsonb,
   '{"ar":"أولى لحظات أطفالك","en":"Your child''s first treasures"}'::jsonb,
   '#ecdfc8', true, 3)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description,
  tone = excluded.tone, is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------
-- 4. PRODUCTS — deliberately NOT seeded
--
-- This script used to insert 8 demo products (Layan Bracelet, Noor Pendant, …)
-- with `on conflict (slug) do update set name = …, price = …`. That made
-- re-running it DESTRUCTIVE: it silently reset the name, description, price,
-- category, collection and material of any product sharing one of those slugs,
-- wiping edits made in the admin panel.
--
-- Products are real business data. They belong to the shop owner and are
-- managed in Admin → Products, not checked into source control. A schema script
-- has no business overwriting them.
--
-- The categories and collections above ARE still seeded, because products
-- reference them and the storefront needs at least one of each to render.
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- 5. SEED — admin settings single row
-- ---------------------------------------------------------------------
-- Seed the shipping rates so checkout's server-side calculation always has
-- them. Existing edits are NOT overwritten: the update only fires while the row
-- still holds the empty placeholder.
--
-- Contact fields are seeded EMPTY on purpose. They used to hold sample values
-- ("hello@mashaerjewellery.com", "+971 50 000 0000"), which is how placeholder
-- contact details reached real customers — the floating WhatsApp button pointed
-- at a fake number on every page. The storefront now hides any contact channel
-- whose value is blank, so the owner must set these in Admin → Settings before
-- they appear. See migration 0002.
insert into public.admin_settings (id, data) values (1, '{
  "store": {
    "email": "",
    "phone": "",
    "whatsapp": "",
    "instagram": "",
    "facebook": "",
    "address": ""
  },
  "shipping": {
    "dubai": 0, "abuDhabi": 15, "sharjah": 10, "ajman": 20,
    "ummAlQuwain": 25, "rasAlKhaimah": 25, "fujairah": 25
  }
}'::jsonb)
on conflict (id) do update set data = excluded.data
  where public.admin_settings.data = '{}'::jsonb;

commit;
