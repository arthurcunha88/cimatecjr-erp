-- ============================================================
-- CIMATEC jr. ERP — Banco da Verdade
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Extensão UUID (já habilitada por padrão no Supabase)
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- Tabela principal: members
-- ────────────────────────────────────────────────────────────
create table if not exists public.members (
  id                   uuid primary key default gen_random_uuid(),
  full_name            text not null,
  institutional_email  text not null,
  phone                text not null,
  birth_date           date not null,
  sex                  text not null check (sex in ('masculino','feminino','outro')),
  gender               text not null check (gender in ('masculino','feminino','outro')),
  color                text not null check (color in ('branca','preta','parda','amarela','indigena','outra')),
  course               text not null check (course in (
                         'eng-computacao','eng-civil','eng-mecanica','eng-quimica',
                         'eng-producao','eng-automacao','eng-eletrica','arq-urbanismo'
                       )),
  course_registration  text not null,
  semester             integer not null check (semester between 1 and 10),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- Unicidade garantida no banco (RN03)
  constraint members_email_unique  unique (institutional_email),
  constraint members_phone_unique  unique (phone),
  constraint members_reg_unique    unique (course_registration)
);

-- ────────────────────────────────────────────────────────────
-- updated_at automático
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists members_updated_at on public.members;
create trigger members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- Tabela de OTCs (One-Time Codes) — RN09 + padrão_otc.md
-- ────────────────────────────────────────────────────────────
create table if not exists public.member_otcs (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  code        text not null,
  type        text not null check (type in ('create_account','password_reset','two_factor_auth','email_change')),
  used        boolean not null default false,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists member_otcs_member_id_idx on public.member_otcs(member_id);
create index if not exists member_otcs_code_idx      on public.member_otcs(code);

-- ────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────
alter table public.members    enable row level security;
alter table public.member_otcs enable row level security;

-- Nenhum acesso público às tabelas.
-- Apenas o service_role (backend) pode ler/escrever.
-- Isso garante que o anon key do frontend não acessa dados diretamente.

-- Revogar acesso anônimo explicitamente
revoke all on public.members     from anon, authenticated;
revoke all on public.member_otcs from anon, authenticated;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
