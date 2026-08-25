-- ============================================
-- Dorah — Esquema inicial de productos
-- ============================================

create type product_category as enum ('arabes', 'disenador', 'decants', 'accesorios');

create table products (
  id uuid primary key default gen_random_uuid(),
  category product_category not null,
  brand text not null,
  name text not null,
  price numeric,          -- arabes / disenador / accesorios
  price_5ml numeric,       -- solo decants
  price_10ml numeric,      -- solo decants
  image_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Índice para filtrar rápido por categoría (lo vas a usar en cada sección del sitio)
create index idx_products_category on products(category);

-- Habilitar Row Level Security (buena práctica desde el día 1)
alter table products enable row level security;

-- Política: cualquiera puede LEER productos activos (catálogo público)
create policy "Productos activos son públicos"
  on products for select
  using (active = true);

-- Nota: para que el admin panel pueda insertar/editar/borrar,
-- vas a necesitar una policy adicional restringida a un usuario autenticado
-- (o usar la service_role key desde el backend del admin, sin pasar por RLS).
