-- Migración 004: Tabla de imágenes editables por sección
-- Fecha: 2026-09-07
-- Descripción: Almacena las imágenes reemplazables (portadas y testimonios) de las
--              páginas públicas Inicio, Quiénes Somos, Contáctenos, Voluntarios y
--              Donaciones. Cada fila es un "slot" fijo (pagina + clave); si
--              url_imagen es NULL, el frontend usa su imagen por defecto.

-- ============================================================
-- UP
-- ============================================================

CREATE TABLE IF NOT EXISTS imagenes_secciones (
  id              SERIAL PRIMARY KEY,
  pagina          VARCHAR(50)  NOT NULL,
  clave           VARCHAR(50)  NOT NULL,
  etiqueta        VARCHAR(150) NOT NULL,
  nombre_archivo  VARCHAR(255),
  url_imagen      TEXT,
  ruta_archivo    TEXT,
  tamano_archivo  BIGINT,
  actualizado_en  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (pagina, clave)
);

COMMENT ON TABLE  imagenes_secciones                IS 'Imágenes reemplazables de las páginas públicas (portadas y testimonios). Slots fijos identificados por (pagina, clave).';
COMMENT ON COLUMN imagenes_secciones.pagina          IS 'Página pública a la que pertenece el slot: inicio, quienes_somos, contacto, voluntarios, donaciones.';
COMMENT ON COLUMN imagenes_secciones.clave           IS 'Identificador del slot dentro de la página, ej: hero, testimonio_1.';
COMMENT ON COLUMN imagenes_secciones.etiqueta        IS 'Texto legible mostrado en el panel admin para identificar el slot.';
COMMENT ON COLUMN imagenes_secciones.url_imagen      IS 'URL pública de Cloudinary. NULL significa que se usa la imagen por defecto del frontend.';
COMMENT ON COLUMN imagenes_secciones.ruta_archivo    IS 'public_id de Cloudinary, usado para poder borrar el archivo al reemplazar o restablecer.';

-- Seed: crea los slots fijos si aún no existen (no se crean slots desde el admin)
INSERT INTO imagenes_secciones (pagina, clave, etiqueta) VALUES
  ('inicio',        'hero',        'Inicio - Portada'),
  ('quienes_somos',  'hero',        'Quienes Somos - Portada'),
  ('quienes_somos',  'testimonio_1','Quienes Somos - Testimonio 1'),
  ('quienes_somos',  'testimonio_2','Quienes Somos - Testimonio 2'),
  ('quienes_somos',  'testimonio_3','Quienes Somos - Testimonio 3'),
  ('contacto',       'hero',        'Contactenos - Portada'),
  ('voluntarios',    'hero',        'Voluntarios - Portada'),
  ('donaciones',     'hero',        'Donaciones - Portada')
ON CONFLICT (pagina, clave) DO NOTHING;

-- ============================================================
-- DOWN (rollback)
-- DROP TABLE IF EXISTS imagenes_secciones;
-- ============================================================
