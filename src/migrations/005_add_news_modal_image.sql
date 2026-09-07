-- Migración 005: Imagen del modal de noticias
-- Fecha: 2026-09-07
-- Descripción: Agrega soporte para una imagen opcional en el header del modal
--              flotante de noticias/campañas.

-- ============================================================
-- UP
-- ============================================================

ALTER TABLE configuracion_modal_noticia
  ADD COLUMN IF NOT EXISTS imagen_url TEXT,
  ADD COLUMN IF NOT EXISTS imagen_public_id TEXT;

COMMENT ON COLUMN configuracion_modal_noticia.imagen_url        IS 'URL pública de Cloudinary de la imagen del header del modal. NULL = fondo decorativo por defecto.';
COMMENT ON COLUMN configuracion_modal_noticia.imagen_public_id  IS 'public_id de Cloudinary, usado para poder borrar el archivo al reemplazar o quitar la imagen.';

-- ============================================================
-- DOWN (rollback)
-- ALTER TABLE configuracion_modal_noticia DROP COLUMN IF EXISTS imagen_url, DROP COLUMN IF EXISTS imagen_public_id;
-- ============================================================
