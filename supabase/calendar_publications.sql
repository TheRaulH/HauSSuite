-- HauSSuite · Calendario de contenidos
-- Ejecutar una vez en Supabase → SQL Editor.

create table if not exists public.publications (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(btrim(title)) > 0),
  description    text,
  post_type      text not null default 'photo'  check (post_type    in ('video', 'photo')),
  post_subtype   text not null default 'single' check (post_subtype in ('carousel', 'single')),
  priority       text not null default 'B'      check (priority     in ('A', 'B', 'C')),
  purpose        text[] not null default '{}',
  scheduled_date date not null,
  is_published   boolean not null default false,
  published_at   timestamptz,
  status         text not null default 'draft'  check (status in ('draft', 'review', 'ready')),
  extra_fields   jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- un video no puede ser carrusel
  constraint publications_video_not_carousel check (not (post_type = 'video' and post_subtype = 'carousel'))
);

create index if not exists publications_scheduled_date_idx on public.publications (scheduled_date);

-- published_at y updated_at los maneja la base de datos (auditoría confiable,
-- no depende del navegador de quien marca el check).
create or replace function public.publications_before_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;

  if new.is_published then
    if new.published_at is null then
      new.published_at := now();
    end if;
  else
    new.published_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists publications_before_write on public.publications;
create trigger publications_before_write
  before insert or update on public.publications
  for each row execute function public.publications_before_write();

-- Seguridad (RLS).
-- ATENCIÓN: HauSSuite no tiene login, así que esta política deja leer/escribir
-- a cualquiera que tenga la anon key (que viaja en el JS público de la web).
-- Sirve mientras la suite sea de uso interno; si la URL es pública, conviene
-- agregar Supabase Auth y cambiar "anon" por "authenticated".
alter table public.publications enable row level security;

drop policy if exists "publications_acceso_total" on public.publications;
create policy "publications_acceso_total"
  on public.publications
  for all
  to anon, authenticated
  using (true)
  with check (true);
