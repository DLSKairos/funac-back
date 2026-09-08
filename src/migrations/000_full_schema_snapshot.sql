-- Snapshot completo del esquema de la base de datos FUNAC
-- Generado con pg_dump --schema-only desde la BD local de desarrollo
-- Fecha: 2026-09-07
--
-- Uso: este archivo NO es parte de la serie de migraciones incrementales (003, 004, 005).
-- Es un snapshot de referencia para provisionar una base de datos NUEVA (ej. Render Postgres)
-- que arranca vacia. Ya incluye las tablas creadas por las migraciones 003, 004 y 005 -- no
-- hace falta volver a correrlas despues de aplicar este archivo.
--
-- Este dump es SOLO ESQUEMA (tablas, indices, constraints, funciones) -- NO incluye datos.
-- Despues de aplicarlo, la tabla usuarios_admin (y las demas) estaran vacias: hace falta
-- crear al menos un usuario administrador antes de poder entrar al panel admin.
--
--
-- PostgreSQL database dump
--


-- Dumped from database version 18.0 (Postgres.app)
-- Dumped by pg_dump version 18.0 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: actualizar_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: configuracion_modal_noticia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_modal_noticia (
    id integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    titulo text DEFAULT 'Nueva campaña destacada'::text NOT NULL,
    subtitulo text DEFAULT 'Estamos uniendo esfuerzos para transformar vidas en comunidades vulnerables.'::text NOT NULL,
    badge_texto text DEFAULT 'Noticia destacada'::text NOT NULL,
    highlight_texto text DEFAULT 'Cada donación hace la diferencia.'::text,
    url_destino text DEFAULT '/donaciones'::text NOT NULL,
    etiqueta_boton text DEFAULT 'Quiero ayudar'::text NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    imagen_url text,
    imagen_public_id text
);


--
-- Name: TABLE configuracion_modal_noticia; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.configuracion_modal_noticia IS 'Configuración del modal flotante de noticias/campañas en la página principal. Solo debe existir un registro activo.';


--
-- Name: COLUMN configuracion_modal_noticia.activo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.activo IS 'Controla si el modal es visible para los visitantes.';


--
-- Name: COLUMN configuracion_modal_noticia.titulo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.titulo IS 'Título principal del modal.';


--
-- Name: COLUMN configuracion_modal_noticia.subtitulo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.subtitulo IS 'Texto descriptivo que aparece debajo del título.';


--
-- Name: COLUMN configuracion_modal_noticia.badge_texto; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.badge_texto IS 'Etiqueta/badge que aparece sobre el título (ej: "Noticia destacada").';


--
-- Name: COLUMN configuracion_modal_noticia.highlight_texto; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.highlight_texto IS 'Texto de énfasis secundario, puede ser NULL si no se requiere.';


--
-- Name: COLUMN configuracion_modal_noticia.url_destino; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.url_destino IS 'Ruta o URL a la que redirige el botón de acción.';


--
-- Name: COLUMN configuracion_modal_noticia.etiqueta_boton; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.etiqueta_boton IS 'Texto del botón de llamada a la acción.';


--
-- Name: COLUMN configuracion_modal_noticia.actualizado_en; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.actualizado_en IS 'Marca de tiempo de la última actualización del registro (TIMESTAMPTZ).';


--
-- Name: COLUMN configuracion_modal_noticia.imagen_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.imagen_url IS 'URL pública de Cloudinary de la imagen del header del modal. NULL = fondo decorativo por defecto.';


--
-- Name: COLUMN configuracion_modal_noticia.imagen_public_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.configuracion_modal_noticia.imagen_public_id IS 'public_id de Cloudinary, usado para poder borrar el archivo al reemplazar o quitar la imagen.';


--
-- Name: configuracion_modal_noticia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_modal_noticia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_modal_noticia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_modal_noticia_id_seq OWNED BY public.configuracion_modal_noticia.id;


--
-- Name: configuracion_redes_sociales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_redes_sociales (
    id integer NOT NULL,
    plataforma character varying(50) NOT NULL,
    url text,
    activo boolean DEFAULT false NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: configuracion_redes_sociales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_redes_sociales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_redes_sociales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_redes_sociales_id_seq OWNED BY public.configuracion_redes_sociales.id;


--
-- Name: configuracion_whatsapp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion_whatsapp (
    id integer NOT NULL,
    codigo_pais character varying(10) DEFAULT '+57'::character varying NOT NULL,
    numero character varying(20) NOT NULL,
    mensaje_predeterminado text,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: configuracion_whatsapp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.configuracion_whatsapp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: configuracion_whatsapp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.configuracion_whatsapp_id_seq OWNED BY public.configuracion_whatsapp.id;


--
-- Name: contenido_paginas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contenido_paginas (
    id integer NOT NULL,
    pagina character varying(50) NOT NULL,
    seccion character varying(100) NOT NULL,
    contenido text,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    actualizado_por integer,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    icono character varying(50),
    CONSTRAINT contenido_paginas_pagina_check CHECK (((pagina)::text = ANY ((ARRAY['quienes_somos'::character varying, 'valores'::character varying, 'mision_vision'::character varying, 'contacto'::character varying])::text[])))
);


--
-- Name: contenido_paginas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contenido_paginas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contenido_paginas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contenido_paginas_id_seq OWNED BY public.contenido_paginas.id;


--
-- Name: donaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donaciones (
    id integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    telefono character varying(20),
    cedula character varying(20),
    monto numeric(12,2) NOT NULL,
    moneda character varying(10) DEFAULT 'COP'::character varying NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    referencia_epayco character varying(100),
    ref_payco character varying(200),
    transaction_id character varying(200),
    es_recurrente boolean DEFAULT false NOT NULL,
    frecuencia character varying(20),
    aparecer_muro_donantes boolean DEFAULT false NOT NULL,
    comprobante_enviado boolean DEFAULT false NOT NULL,
    fecha_pago timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT donaciones_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'completada'::character varying, 'fallida'::character varying, 'cancelada'::character varying, 'reembolsada'::character varying])::text[]))),
    CONSTRAINT donaciones_frecuencia_check CHECK ((((frecuencia)::text = ANY ((ARRAY['mensual'::character varying, 'bimestral'::character varying, 'trimestral'::character varying, 'anual'::character varying])::text[])) OR (frecuencia IS NULL)))
);


--
-- Name: donaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.donaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: donaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.donaciones_id_seq OWNED BY public.donaciones.id;


--
-- Name: formularios_contacto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.formularios_contacto (
    id integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    telefono character varying(20),
    asunto character varying(200) NOT NULL,
    mensaje text NOT NULL,
    leido boolean DEFAULT false NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: formularios_contacto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.formularios_contacto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: formularios_contacto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.formularios_contacto_id_seq OWNED BY public.formularios_contacto.id;


--
-- Name: imagenes_carrusel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imagenes_carrusel (
    id integer NOT NULL,
    titulo character varying(200),
    descripcion text,
    nombre_archivo character varying(255) NOT NULL,
    url_imagen text NOT NULL,
    ruta_archivo text NOT NULL,
    tamano_archivo bigint,
    ancho integer,
    alto integer,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    subido_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: imagenes_carrusel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.imagenes_carrusel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: imagenes_carrusel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.imagenes_carrusel_id_seq OWNED BY public.imagenes_carrusel.id;


--
-- Name: imagenes_secciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imagenes_secciones (
    id integer NOT NULL,
    pagina character varying(50) NOT NULL,
    clave character varying(50) NOT NULL,
    etiqueta character varying(150) NOT NULL,
    nombre_archivo character varying(255),
    url_imagen text,
    ruta_archivo text,
    tamano_archivo bigint,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE imagenes_secciones; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.imagenes_secciones IS 'Imágenes reemplazables de las páginas públicas (portadas y testimonios). Slots fijos identificados por (pagina, clave).';


--
-- Name: COLUMN imagenes_secciones.pagina; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.imagenes_secciones.pagina IS 'Página pública a la que pertenece el slot: inicio, quienes_somos, contacto, voluntarios, donaciones.';


--
-- Name: COLUMN imagenes_secciones.clave; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.imagenes_secciones.clave IS 'Identificador del slot dentro de la página, ej: hero, testimonio_1.';


--
-- Name: COLUMN imagenes_secciones.etiqueta; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.imagenes_secciones.etiqueta IS 'Texto legible mostrado en el panel admin para identificar el slot.';


--
-- Name: COLUMN imagenes_secciones.url_imagen; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.imagenes_secciones.url_imagen IS 'URL pública de Cloudinary. NULL significa que se usa la imagen por defecto del frontend.';


--
-- Name: COLUMN imagenes_secciones.ruta_archivo; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.imagenes_secciones.ruta_archivo IS 'public_id de Cloudinary, usado para poder borrar el archivo al reemplazar o restablecer.';


--
-- Name: imagenes_secciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.imagenes_secciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: imagenes_secciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.imagenes_secciones_id_seq OWNED BY public.imagenes_secciones.id;


--
-- Name: logs_actividad_admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logs_actividad_admin (
    id integer NOT NULL,
    usuario_id integer,
    accion character varying(100) NOT NULL,
    descripcion text,
    ip_address character varying(45),
    recurso_id integer,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: logs_actividad_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.logs_actividad_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs_actividad_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logs_actividad_admin_id_seq OWNED BY public.logs_actividad_admin.id;


--
-- Name: pdfs_informativos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pdfs_informativos (
    id integer NOT NULL,
    titulo character varying(300) NOT NULL,
    descripcion text,
    nombre_archivo character varying(255) NOT NULL,
    url_pdf text NOT NULL,
    ruta_archivo text NOT NULL,
    tamano_archivo bigint,
    descargas integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    subido_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pdfs_informativos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pdfs_informativos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pdfs_informativos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pdfs_informativos_id_seq OWNED BY public.pdfs_informativos.id;


--
-- Name: usuarios_admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios_admin (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    ultimo_acceso timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: usuarios_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_admin_id_seq OWNED BY public.usuarios_admin.id;


--
-- Name: vista_donaciones_mensuales; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vista_donaciones_mensuales AS
 SELECT date_trunc('month'::text, creado_en) AS mes,
    to_char(date_trunc('month'::text, creado_en), 'YYYY-MM'::text) AS mes_codigo,
    to_char(date_trunc('month'::text, creado_en), 'Month YYYY'::text) AS mes_label,
    count(*) AS cantidad,
    count(
        CASE
            WHEN ((estado)::text = 'completada'::text) THEN 1
            ELSE NULL::integer
        END) AS completadas,
    COALESCE(sum(
        CASE
            WHEN ((estado)::text = 'completada'::text) THEN monto
            ELSE (0)::numeric
        END), (0)::numeric) AS total_recaudado,
    count(
        CASE
            WHEN (es_recurrente = true) THEN 1
            ELSE NULL::integer
        END) AS recurrentes
   FROM public.donaciones
  GROUP BY (date_trunc('month'::text, creado_en))
  ORDER BY (date_trunc('month'::text, creado_en)) DESC;


--
-- Name: voluntarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voluntarios (
    id integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    cedula character varying(20) NOT NULL,
    email character varying(150) NOT NULL,
    telefono character varying(20) NOT NULL,
    ciudad character varying(100) NOT NULL,
    direccion character varying(250),
    fecha_nacimiento date,
    nivel_estudios character varying(100),
    profesion_ocupacion character varying(150),
    habilidades_especiales text,
    disponibilidad_horaria character varying(100),
    motivacion text,
    areas_interes jsonb,
    estado character varying(30) DEFAULT 'pendiente'::character varying NOT NULL,
    notas_admin text,
    nombre_archivo_cv character varying(255),
    ruta_archivo_cv text,
    url_cv text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT voluntarios_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'en_revision'::character varying, 'aprobado'::character varying, 'rechazado'::character varying, 'inactivo'::character varying])::text[])))
);


--
-- Name: vista_estadisticas_dashboard; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vista_estadisticas_dashboard AS
 SELECT ( SELECT count(*) AS count
           FROM public.voluntarios) AS total_voluntarios,
    ( SELECT count(*) AS count
           FROM public.voluntarios
          WHERE ((voluntarios.estado)::text = 'pendiente'::text)) AS voluntarios_pendientes,
    ( SELECT count(*) AS count
           FROM public.voluntarios
          WHERE ((voluntarios.estado)::text = 'aprobado'::text)) AS voluntarios_aprobados,
    ( SELECT count(*) AS count
           FROM public.voluntarios
          WHERE (voluntarios.creado_en >= (now() - '30 days'::interval))) AS voluntarios_ultimos_30_dias,
    ( SELECT count(*) AS count
           FROM public.donaciones) AS total_donaciones,
    ( SELECT count(*) AS count
           FROM public.donaciones
          WHERE ((donaciones.estado)::text = 'completada'::text)) AS donaciones_completadas,
    ( SELECT count(*) AS count
           FROM public.donaciones
          WHERE ((donaciones.estado)::text = 'pendiente'::text)) AS donaciones_pendientes,
    ( SELECT COALESCE(sum(donaciones.monto), (0)::numeric) AS "coalesce"
           FROM public.donaciones
          WHERE ((donaciones.estado)::text = 'completada'::text)) AS total_recaudado,
    ( SELECT COALESCE(sum(donaciones.monto), (0)::numeric) AS "coalesce"
           FROM public.donaciones
          WHERE (((donaciones.estado)::text = 'completada'::text) AND (donaciones.creado_en >= (now() - '30 days'::interval)))) AS recaudado_30_dias,
    ( SELECT count(*) AS count
           FROM public.formularios_contacto) AS total_contactos,
    ( SELECT count(*) AS count
           FROM public.formularios_contacto
          WHERE (formularios_contacto.leido = false)) AS contactos_no_leidos,
    ( SELECT count(*) AS count
           FROM public.formularios_contacto
          WHERE (formularios_contacto.creado_en >= (now() - '7 days'::interval))) AS contactos_ultimos_7_dias,
    ( SELECT count(*) AS count
           FROM public.imagenes_carrusel
          WHERE (imagenes_carrusel.activo = true)) AS imagenes_carrusel_activas,
    ( SELECT count(*) AS count
           FROM public.pdfs_informativos
          WHERE (pdfs_informativos.activo = true)) AS pdfs_activos,
    ( SELECT COALESCE(sum(pdfs_informativos.descargas), (0)::bigint) AS "coalesce"
           FROM public.pdfs_informativos) AS total_descargas_pdfs;


--
-- Name: voluntarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.voluntarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: voluntarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.voluntarios_id_seq OWNED BY public.voluntarios.id;


--
-- Name: configuracion_modal_noticia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_modal_noticia ALTER COLUMN id SET DEFAULT nextval('public.configuracion_modal_noticia_id_seq'::regclass);


--
-- Name: configuracion_redes_sociales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_redes_sociales ALTER COLUMN id SET DEFAULT nextval('public.configuracion_redes_sociales_id_seq'::regclass);


--
-- Name: configuracion_whatsapp id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_whatsapp ALTER COLUMN id SET DEFAULT nextval('public.configuracion_whatsapp_id_seq'::regclass);


--
-- Name: contenido_paginas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contenido_paginas ALTER COLUMN id SET DEFAULT nextval('public.contenido_paginas_id_seq'::regclass);


--
-- Name: donaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donaciones ALTER COLUMN id SET DEFAULT nextval('public.donaciones_id_seq'::regclass);


--
-- Name: formularios_contacto id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formularios_contacto ALTER COLUMN id SET DEFAULT nextval('public.formularios_contacto_id_seq'::regclass);


--
-- Name: imagenes_carrusel id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagenes_carrusel ALTER COLUMN id SET DEFAULT nextval('public.imagenes_carrusel_id_seq'::regclass);


--
-- Name: imagenes_secciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagenes_secciones ALTER COLUMN id SET DEFAULT nextval('public.imagenes_secciones_id_seq'::regclass);


--
-- Name: logs_actividad_admin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_actividad_admin ALTER COLUMN id SET DEFAULT nextval('public.logs_actividad_admin_id_seq'::regclass);


--
-- Name: pdfs_informativos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdfs_informativos ALTER COLUMN id SET DEFAULT nextval('public.pdfs_informativos_id_seq'::regclass);


--
-- Name: usuarios_admin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_admin ALTER COLUMN id SET DEFAULT nextval('public.usuarios_admin_id_seq'::regclass);


--
-- Name: voluntarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voluntarios ALTER COLUMN id SET DEFAULT nextval('public.voluntarios_id_seq'::regclass);


--
-- Name: configuracion_modal_noticia configuracion_modal_noticia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_modal_noticia
    ADD CONSTRAINT configuracion_modal_noticia_pkey PRIMARY KEY (id);


--
-- Name: configuracion_redes_sociales configuracion_redes_sociales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_redes_sociales
    ADD CONSTRAINT configuracion_redes_sociales_pkey PRIMARY KEY (id);


--
-- Name: configuracion_redes_sociales configuracion_redes_sociales_plataforma_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_redes_sociales
    ADD CONSTRAINT configuracion_redes_sociales_plataforma_key UNIQUE (plataforma);


--
-- Name: configuracion_whatsapp configuracion_whatsapp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion_whatsapp
    ADD CONSTRAINT configuracion_whatsapp_pkey PRIMARY KEY (id);


--
-- Name: contenido_paginas contenido_paginas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contenido_paginas
    ADD CONSTRAINT contenido_paginas_pkey PRIMARY KEY (id);


--
-- Name: donaciones donaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donaciones
    ADD CONSTRAINT donaciones_pkey PRIMARY KEY (id);


--
-- Name: donaciones donaciones_referencia_epayco_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donaciones
    ADD CONSTRAINT donaciones_referencia_epayco_key UNIQUE (referencia_epayco);


--
-- Name: formularios_contacto formularios_contacto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formularios_contacto
    ADD CONSTRAINT formularios_contacto_pkey PRIMARY KEY (id);


--
-- Name: imagenes_carrusel imagenes_carrusel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagenes_carrusel
    ADD CONSTRAINT imagenes_carrusel_pkey PRIMARY KEY (id);


--
-- Name: imagenes_secciones imagenes_secciones_pagina_clave_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagenes_secciones
    ADD CONSTRAINT imagenes_secciones_pagina_clave_key UNIQUE (pagina, clave);


--
-- Name: imagenes_secciones imagenes_secciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagenes_secciones
    ADD CONSTRAINT imagenes_secciones_pkey PRIMARY KEY (id);


--
-- Name: logs_actividad_admin logs_actividad_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_actividad_admin
    ADD CONSTRAINT logs_actividad_admin_pkey PRIMARY KEY (id);


--
-- Name: pdfs_informativos pdfs_informativos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pdfs_informativos
    ADD CONSTRAINT pdfs_informativos_pkey PRIMARY KEY (id);


--
-- Name: contenido_paginas uq_pagina_seccion; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contenido_paginas
    ADD CONSTRAINT uq_pagina_seccion UNIQUE (pagina, seccion);


--
-- Name: usuarios_admin usuarios_admin_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_admin
    ADD CONSTRAINT usuarios_admin_email_key UNIQUE (email);


--
-- Name: usuarios_admin usuarios_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_admin
    ADD CONSTRAINT usuarios_admin_pkey PRIMARY KEY (id);


--
-- Name: usuarios_admin usuarios_admin_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios_admin
    ADD CONSTRAINT usuarios_admin_username_key UNIQUE (username);


--
-- Name: voluntarios voluntarios_cedula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voluntarios
    ADD CONSTRAINT voluntarios_cedula_key UNIQUE (cedula);


--
-- Name: voluntarios voluntarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voluntarios
    ADD CONSTRAINT voluntarios_email_key UNIQUE (email);


--
-- Name: voluntarios voluntarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voluntarios
    ADD CONSTRAINT voluntarios_pkey PRIMARY KEY (id);


--
-- Name: idx_carrusel_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_carrusel_activo ON public.imagenes_carrusel USING btree (activo);


--
-- Name: idx_carrusel_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_carrusel_orden ON public.imagenes_carrusel USING btree (orden);


--
-- Name: idx_contacto_creado_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacto_creado_en ON public.formularios_contacto USING btree (creado_en DESC);


--
-- Name: idx_contacto_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacto_email ON public.formularios_contacto USING btree (email);


--
-- Name: idx_contacto_leido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacto_leido ON public.formularios_contacto USING btree (leido);


--
-- Name: idx_donaciones_creado_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donaciones_creado_en ON public.donaciones USING btree (creado_en DESC);


--
-- Name: idx_donaciones_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donaciones_email ON public.donaciones USING btree (email);


--
-- Name: idx_donaciones_es_recurrente; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donaciones_es_recurrente ON public.donaciones USING btree (es_recurrente);


--
-- Name: idx_donaciones_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donaciones_estado ON public.donaciones USING btree (estado);


--
-- Name: idx_donaciones_monto; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donaciones_monto ON public.donaciones USING btree (monto);


--
-- Name: idx_donaciones_referencia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donaciones_referencia ON public.donaciones USING btree (referencia_epayco);


--
-- Name: idx_logs_accion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_accion ON public.logs_actividad_admin USING btree (accion);


--
-- Name: idx_logs_creado_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_creado_en ON public.logs_actividad_admin USING btree (creado_en DESC);


--
-- Name: idx_logs_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logs_usuario ON public.logs_actividad_admin USING btree (usuario_id);


--
-- Name: idx_paginas_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paginas_activo ON public.contenido_paginas USING btree (activo);


--
-- Name: idx_paginas_orden; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paginas_orden ON public.contenido_paginas USING btree (pagina, orden);


--
-- Name: idx_paginas_pagina; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_paginas_pagina ON public.contenido_paginas USING btree (pagina);


--
-- Name: idx_pdfs_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pdfs_activo ON public.pdfs_informativos USING btree (activo);


--
-- Name: idx_pdfs_subido_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pdfs_subido_en ON public.pdfs_informativos USING btree (subido_en DESC);


--
-- Name: idx_redes_plataforma; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_redes_plataforma ON public.configuracion_redes_sociales USING btree (plataforma);


--
-- Name: idx_usuarios_admin_activo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_admin_activo ON public.usuarios_admin USING btree (activo);


--
-- Name: idx_usuarios_admin_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_admin_email ON public.usuarios_admin USING btree (email);


--
-- Name: idx_usuarios_admin_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_admin_username ON public.usuarios_admin USING btree (username);


--
-- Name: idx_voluntarios_cedula; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voluntarios_cedula ON public.voluntarios USING btree (cedula);


--
-- Name: idx_voluntarios_ciudad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voluntarios_ciudad ON public.voluntarios USING btree (ciudad);


--
-- Name: idx_voluntarios_creado_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voluntarios_creado_en ON public.voluntarios USING btree (creado_en DESC);


--
-- Name: idx_voluntarios_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voluntarios_email ON public.voluntarios USING btree (email);


--
-- Name: idx_voluntarios_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voluntarios_estado ON public.voluntarios USING btree (estado);


--
-- Name: idx_voluntarios_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_voluntarios_nombre ON public.voluntarios USING gin (to_tsvector('spanish'::regconfig, (nombre_completo)::text));


--
-- Name: imagenes_carrusel trg_carrusel_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_carrusel_timestamp BEFORE UPDATE ON public.imagenes_carrusel FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: donaciones trg_donaciones_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_donaciones_timestamp BEFORE UPDATE ON public.donaciones FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: contenido_paginas trg_paginas_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_paginas_timestamp BEFORE UPDATE ON public.contenido_paginas FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: pdfs_informativos trg_pdfs_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_pdfs_timestamp BEFORE UPDATE ON public.pdfs_informativos FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: configuracion_redes_sociales trg_redes_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_redes_timestamp BEFORE UPDATE ON public.configuracion_redes_sociales FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: usuarios_admin trg_usuarios_admin_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_usuarios_admin_timestamp BEFORE UPDATE ON public.usuarios_admin FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: voluntarios trg_voluntarios_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_voluntarios_timestamp BEFORE UPDATE ON public.voluntarios FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: configuracion_whatsapp trg_whatsapp_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_whatsapp_timestamp BEFORE UPDATE ON public.configuracion_whatsapp FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp();


--
-- Name: contenido_paginas contenido_paginas_actualizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contenido_paginas
    ADD CONSTRAINT contenido_paginas_actualizado_por_fkey FOREIGN KEY (actualizado_por) REFERENCES public.usuarios_admin(id) ON DELETE SET NULL;


--
-- Name: logs_actividad_admin logs_actividad_admin_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logs_actividad_admin
    ADD CONSTRAINT logs_actividad_admin_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios_admin(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


