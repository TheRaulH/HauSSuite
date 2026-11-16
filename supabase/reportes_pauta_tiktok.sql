-- HauSSuite · Reportes · Pauta de TikTok
-- Ejecutar una vez en Supabase → SQL Editor (después de script_pauta_tiktok_supabase.sql).
-- Crea dos vistas de SOLO LECTURA que usa la página Reportes. No modifica tus tablas.

-- 1) Una fila por pauta (live o video) con su inversión y lo que vendió.
--    inversion_bs = (coste del anuncio + tarifa Apple) × tipo de cambio.
create or replace view public.v_reporte_pauta as
select
  p.id,
  p.pedido_tiktok_id,
  p.sucursal,
  p.fecha_hora,
  p.tipo,
  p.titulo,
  p.estado,
  p.objetivo,
  p.duracion,
  p.coste_anuncio_usd,
  p.tarifa_apple_usd,
  p.costo_total_usd,
  p.tipo_cambio,
  round(p.costo_total_usd * p.tipo_cambio, 2)  as inversion_bs,
  p.espectadores,
  p.impresiones,
  p.tiempo_promedio_visualizacion_seg,
  p.me_gusta,
  p.comentarios,
  p.compartidos,
  p.nuevos_seguidores,
  p.visitas_perfil,
  coalesce(v.lineas, 0)               as ventas_lineas,
  coalesce(v.facturas, 0)             as ventas_facturas,
  coalesce(v.unidades, 0)             as ventas_unidades,
  coalesce(v.facturado_bs, 0)         as facturado_bs,
  coalesce(v.ganancia_bs, 0)          as ganancia_bs,
  coalesce(v.lineas_otra_sucursal, 0) as ventas_otra_sucursal
from public.pauta p
left join lateral (
  select
    count(*)                              as lineas,
    count(distinct s.numero_factura)      as facturas,
    sum(s.cantidad)                       as unidades,
    sum(s.total_cobrado)                  as facturado_bs,
    sum(s.ganancia_neta_venta)            as ganancia_bs,
    count(*) filter (where s.sucursal <> p.sucursal) as lineas_otra_sucursal
  from public.ventas s
  where s.pauta_id = p.id
) v on true;

-- 2) Ventas que todavía NO están vinculadas a ninguna pauta (para revisarlas en el reporte).
create or replace view public.v_reporte_ventas_sin_pauta as
select
  s.id,
  s.numero_factura,
  pr.nombre as producto,
  s.sucursal,
  s.cantidad,
  s.total_cobrado,
  s.ganancia_neta_venta,
  s.fecha_venta
from public.ventas s
join public.productos pr on pr.id = s.producto_id
where s.pauta_id is null;

grant select on public.v_reporte_pauta            to anon, authenticated;
grant select on public.v_reporte_ventas_sin_pauta to anon, authenticated;

-- ---------------------------------------------------------------------------
-- OPCIONAL (revisar antes de ejecutar)
--
-- A) La restricción chk_pauta_un_solo_producto obliga a que una venta vinculada
--    a una pauta tenga cantidad = 1. Eso impide vincular líneas como "2 almohadas"
--    o "4 packs". Si el descuento del live puede aplicarse a más de una unidad,
--    elimínala:
--
--    alter table public.ventas drop constraint chk_pauta_un_solo_producto;
--
-- B) Seguridad. Las vistas de arriba se leen con la anon key (la del navegador).
--    Si tus tablas base (pauta, ventas, productos) no tienen RLS activado, esa
--    misma llave también puede leerlas y MODIFICARLAS. Para cerrarlas sin romper
--    las vistas (que corren con permisos del dueño):
--
--    alter table public.pauta      enable row level security;
--    alter table public.ventas     enable row level security;
--    alter table public.productos  enable row level security;
--    alter table public.sucursales enable row level security;
--    revoke all on public.pauta, public.ventas, public.productos, public.sucursales from anon;
--
--    (Antes confirma que ninguna otra app, como el generador de cupones, use
--    estas tablas con la anon key.)
-- ---------------------------------------------------------------------------
