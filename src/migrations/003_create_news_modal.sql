-- Migración 003: Tabla de configuración del modal de noticias flotante
-- Fecha: 2026-05-15
-- Descripción: Almacena la configuración del modal promocional que aparece
--              en la página principal para destacar campañas o noticias.

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracion_modal_noticia (
  id                SERIAL PRIMARY KEY,
  activo            BOOLEAN                  NOT NULL DEFAULT TRUE,
  titulo            TEXT                     NOT NULL DEFAULT 'Nueva campaña destacada',
  subtitulo         TEXT                     NOT NULL DEFAULT 'Estamos uniendo esfuerzos para transformar vidas en comunidades vulnerables.',
  badge_texto       TEXT                     NOT NULL DEFAULT 'Noticia destacada',
  highlight_texto   TEXT                              DEFAULT 'Cada donación hace la diferencia.',
  url_destino       TEXT                     NOT NULL DEFAULT '/donaciones',
  etiqueta_boton    TEXT                     NOT NULL DEFAULT 'Quiero ayudar',
  actualizado_en    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  configuracion_modal_noticia                IS 'Configuración del modal flotante de noticias/campañas en la página principal. Solo debe existir un registro activo.';
COMMENT ON COLUMN configuracion_modal_noticia.activo          IS 'Controla si el modal es visible para los visitantes.';
COMMENT ON COLUMN configuracion_modal_noticia.titulo          IS 'Título principal del modal.';
COMMENT ON COLUMN configuracion_modal_noticia.subtitulo       IS 'Texto descriptivo que aparece debajo del título.';
COMMENT ON COLUMN configuracion_modal_noticia.badge_texto     IS 'Etiqueta/badge que aparece sobre el título (ej: "Noticia destacada").';
COMMENT ON COLUMN configuracion_modal_noticia.highlight_texto IS 'Texto de énfasis secundario, puede ser NULL si no se requiere.';
COMMENT ON COLUMN configuracion_modal_noticia.url_destino     IS 'Ruta o URL a la que redirige el botón de acción.';
COMMENT ON COLUMN configuracion_modal_noticia.etiqueta_boton  IS 'Texto del botón de llamada a la acción.';
COMMENT ON COLUMN configuracion_modal_noticia.actualizado_en  IS 'Marca de tiempo de la última actualización del registro (TIMESTAMPTZ).';

-- Insertar registro inicial solo si la tabla está vacía
INSERT INTO configuracion_modal_noticia (
  activo,
  titulo,
  subtitulo,
  badge_texto,
  highlight_texto,
  url_destino,
  etiqueta_boton
)
SELECT
  TRUE,
  'Nueva campaña "Construyendo Sonrisas"',
  'Estamos uniendo esfuerzos para llevar útiles escolares y kits de salud a más de 500 niños en zonas rurales. Tu aporte, por pequeño que sea, transforma vidas.',
  'Noticia destacada',
  'Hasta el 30 de junio: cada donación será duplicada por nuestros aliados.',
  '/donaciones',
  'Quiero ayudar'
WHERE NOT EXISTS (SELECT 1 FROM configuracion_modal_noticia);

-- ============================================================
-- DOWN (rollback)
-- DROP TABLE IF EXISTS configuracion_modal_noticia;
-- ============================================================
