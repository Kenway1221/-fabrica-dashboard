-- Rode este arquivo inteiro no Supabase: SQL Editor > New query > Run

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text
);

create table if not exists public.producao_diaria (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  modelo text not null,
  quantidade_enfestada integer not null default 0,
  quantidade_cortada integer not null default 0,
  responsavel_enfesto text,
  responsavel_corte text,
  status text not null default 'concluido',
  created_at timestamptz not null default now()
);

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente text not null,
  modelo text not null,
  quantidade integer not null default 0,
  valor_unitario numeric(10,2) not null default 0,
  data_entrega date not null,
  status text not null default 'a_enfestar'
    check (status in ('a_enfestar','cortando','na_costureira','entregue')),
  created_at timestamptz not null default now()
);

create table if not exists public.custos (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  descricao text not null,
  valor numeric(10,2) not null default 0
);

-- Cria o profile automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Segurança: só usuários logados acessam
alter table public.profiles enable row level security;
alter table public.producao_diaria enable row level security;
alter table public.pedidos enable row level security;
alter table public.custos enable row level security;

create policy "auth_all" on public.profiles for all to authenticated using (true) with check (true);
create policy "auth_all" on public.producao_diaria for all to authenticated using (true) with check (true);
create policy "auth_all" on public.pedidos for all to authenticated using (true) with check (true);
create policy "auth_all" on public.custos for all to authenticated using (true) with check (true);

-- (Opcional) dados de exemplo para ver o dashboard preenchido
insert into public.pedidos (cliente, modelo, quantidade, valor_unitario, data_entrega, status) values
 ('Belíssima','Cropped Viés',300,18.5,current_date + 3,'cortando'),
 ('Rio das Pedras','Regata Alana',200,15,current_date + 6,'a_enfestar'),
 ('Jhonny','Blusa Tala',150,22,current_date - 2,'entregue'),
 ('Rua','Gola Boba',120,19,current_date + 1,'na_costureira');
insert into public.producao_diaria (data, modelo, quantidade_enfestada, quantidade_cortada, responsavel_enfesto, responsavel_corte, status)
select current_date - g, (array['Cropped Viés','Regata Alana','Blusa Tala','Gola Boba'])[1 + g % 4],
       100 + g * 15, 90 + g * 12, (array['Daniel','Carlos','Diogo','Leo'])[1 + g % 4], 'Gustavo', 'concluido'
from generate_series(0, 8) g;
