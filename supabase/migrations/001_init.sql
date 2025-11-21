-- Enable uuid gen extension
create extension if not exists "pgcrypto";

-- Profiles table linked to auth.users
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Pacientes (patients)
create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  cpf text,
  data_nascimento date,
  email text,
  created_at timestamptz default now()
);

-- Profissionais (professionals)
create table if not exists profissionais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  especialidade text,
  telefone text,
  email text,
  created_at timestamptz default now()
);

-- Atendimentos (appointments)
create table if not exists atendimentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes(id) on delete cascade,
  profissional_id uuid references profissionais(id) on delete set null,
  data timestamptz not null,
  duracao_minutes int,
  anotacoes text,
  criado_por uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_atendimentos_data on atendimentos (data);
