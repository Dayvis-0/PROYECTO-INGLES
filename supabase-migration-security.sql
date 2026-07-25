-- ============================================
-- MIGRACIÓN COMPLETA — LEARN ENGLISH UNAJMA
-- ============================================
-- SCRIPT ÚNICO: crea tablas, datos de prueba,
-- y configura login directo (nombre_usuario +
-- contrasena en texto plano).
--
-- IDEMPOTENTE: se puede ejecutar mil veces.
-- EJECUTAR EN SQL EDITOR DE SUPABASE
-- ============================================

-- ============================================
-- PASO 1: CREAR TABLAS (SI NO EXISTEN)
-- ============================================

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario      SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(30) NOT NULL,
    nombre_usuario  VARCHAR(25) UNIQUE NOT NULL,
    contrasena      VARCHAR(30),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS docente (
    id_docente  SERIAL PRIMARY KEY,
    id_usuario  INT NOT NULL UNIQUE,
    CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS estudiante (
    id_estudiante SERIAL PRIMARY KEY,
    id_usuario    INT NOT NULL UNIQUE,
    CONSTRAINT fk_estudiante_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS leccion (
    id_leccion     TEXT PRIMARY KEY,
    id_docente     INT NOT NULL,
    titulo         VARCHAR(80) NOT NULL,
    estado_activo  BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_leccion_docente FOREIGN KEY (id_docente)
        REFERENCES docente(id_docente)
);

CREATE TABLE IF NOT EXISTS vocabulario (
    id_vocabulario      SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL,
    palabra_ingles      VARCHAR(100) NOT NULL,
    traduccion_espanol  VARCHAR(100) NOT NULL,
    url_audio           VARCHAR(500),
    orden               SMALLINT NOT NULL,
    CONSTRAINT fk_vocabulario_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE IF NOT EXISTS gramatica (
    id_gramatica       SERIAL PRIMARY KEY,
    id_leccion         TEXT NOT NULL UNIQUE,
    nombre_tema        VARCHAR(150) NOT NULL,
    explicacion        TEXT NOT NULL,
    formula            VARCHAR(100),
    ejemplo            TEXT,
    gramatica_columnas JSONB DEFAULT '[]',
    ejemplo_roles      TEXT[] DEFAULT '{}',
    CONSTRAINT fk_gramatica_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE IF NOT EXISTS construccion_oracion (
    id_construccion     SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL,
    oracion_espanol     TEXT NOT NULL,
    respuesta_correcta  TEXT NOT NULL,
    orden               SMALLINT NOT NULL,
    CONSTRAINT fk_construccion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE IF NOT EXISTS palabra_construccion (
    id_palabra       SERIAL PRIMARY KEY,
    id_construccion  INT NOT NULL,
    palabra          VARCHAR(100) NOT NULL,
    orden_correcto   SMALLINT NOT NULL,
    CONSTRAINT fk_palabra_construccion FOREIGN KEY (id_construccion)
        REFERENCES construccion_oracion(id_construccion)
);

CREATE TABLE IF NOT EXISTS pronunciacion (
    id_pronunciacion  SERIAL PRIMARY KEY,
    id_leccion        TEXT NOT NULL,
    oracion_ingles    TEXT NOT NULL,
    orden             SMALLINT NOT NULL,
    CONSTRAINT fk_pronunciacion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE IF NOT EXISTS evaluacion (
    id_evaluacion  SERIAL PRIMARY KEY,
    id_leccion     TEXT NOT NULL UNIQUE,
    CONSTRAINT fk_evaluacion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE IF NOT EXISTS pregunta (
    id_pregunta         SERIAL PRIMARY KEY,
    id_evaluacion       INT NOT NULL,
    enunciado           TEXT NOT NULL,
    alternativa_a       VARCHAR(100) NOT NULL,
    alternativa_b       VARCHAR(100) NOT NULL,
    alternativa_c       VARCHAR(100) NOT NULL,
    alternativa_d       VARCHAR(100) NOT NULL,
    respuesta_correcta  CHAR(1) NOT NULL CHECK (respuesta_correcta IN ('A','B','C','D')),
    orden               SMALLINT NOT NULL,
    CONSTRAINT fk_pregunta_evaluacion FOREIGN KEY (id_evaluacion)
        REFERENCES evaluacion(id_evaluacion)
);

CREATE TABLE IF NOT EXISTS resultado (
    id_leccion_estudiante  SERIAL PRIMARY KEY,
    id_estudiante           INT NOT NULL,
    id_leccion              TEXT NOT NULL,
    fecha_realizacion       TIMESTAMP DEFAULT NOW(),
    nota_obtenida           NUMERIC(5,2),
    aciertos                SMALLINT,
    total_preguntas         SMALLINT,
    estado                  VARCHAR(15) CHECK (estado IN ('aprobado','desaprobado')),
    intentos                SMALLINT DEFAULT 1,
    completada              BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_resultado_estudiante FOREIGN KEY (id_estudiante)
        REFERENCES estudiante(id_estudiante),
    CONSTRAINT fk_resultado_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

-- ============================================
-- PASO 2: ASEGURAR COLUMNA contrasena
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuario' AND column_name = 'contrasena'
    ) THEN
        ALTER TABLE usuario ADD COLUMN contrasena VARCHAR(30);
    END IF;
END $$;

-- ============================================
-- PASO 3: ELIMINAR POLÍTICAS RLS Y FUNCIONES
-- ============================================
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.is_docente();
DROP FUNCTION IF EXISTS public.is_estudiante();

-- ============================================
-- PASO 4: ELIMINAR auth_uid (YA SIN DEPENDENCIAS)
-- ============================================
ALTER TABLE usuario DROP COLUMN IF EXISTS auth_uid;

-- ============================================
-- PASO 5: DESACTIVAR RLS EN TODAS LAS TABLAS
-- ============================================
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE docente DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiante DISABLE ROW LEVEL SECURITY;
ALTER TABLE leccion DISABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulario DISABLE ROW LEVEL SECURITY;
ALTER TABLE gramatica DISABLE ROW LEVEL SECURITY;
ALTER TABLE construccion_oracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE palabra_construccion DISABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE pregunta DISABLE ROW LEVEL SECURITY;
ALTER TABLE resultado DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 6: DATOS DE PRUEBA
-- ============================================

-- Usuarios
INSERT INTO usuario (nombre_completo, nombre_usuario, contrasena) VALUES
('Estudiante', 'estudiante', '1234'),
('Docente', 'docente', '1234')
ON CONFLICT (nombre_usuario) DO UPDATE SET contrasena = '1234';

-- Docente
INSERT INTO docente (id_usuario)
SELECT id_usuario FROM usuario WHERE nombre_usuario = 'docente'
AND NOT EXISTS (SELECT 1 FROM docente d JOIN usuario u ON u.id_usuario = d.id_usuario WHERE u.nombre_usuario = 'docente');

-- Estudiante
INSERT INTO estudiante (id_usuario)
SELECT id_usuario FROM usuario WHERE nombre_usuario = 'estudiante'
AND NOT EXISTS (SELECT 1 FROM estudiante e JOIN usuario u ON u.id_usuario = e.id_usuario WHERE u.nombre_usuario = 'estudiante');

-- Lección 1: Present Simple
INSERT INTO leccion (id_leccion, id_docente, titulo, estado_activo)
SELECT '1', id_docente, 'Present Simple - Rutinas Diarias', TRUE
FROM docente WHERE id_docente = (SELECT id_docente FROM docente LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM leccion WHERE id_leccion = '1');

INSERT INTO vocabulario (id_leccion, palabra_ingles, traduccion_espanol, orden)
SELECT '1', v.* FROM (VALUES
    ('eat',    'comer',    1),
    ('drink',  'beber',    2),
    ('work',   'trabajar', 3),
    ('run',    'correr',   4),
    ('read',   'leer',     5),
    ('write',  'escribir', 6)
) AS v(palabra, trad, ord)
WHERE NOT EXISTS (SELECT 1 FROM vocabulario WHERE id_leccion = '1' LIMIT 1);

INSERT INTO gramatica (id_leccion, nombre_tema, explicacion, formula, ejemplo, gramatica_columnas, ejemplo_roles)
SELECT '1', 'PRESENT SIMPLE',
'El Present Simple se usa para hablar de rutinas, hábitos y hechos permanentes. Para he/she/it se agrega -s o -es al verbo.',
'Subject + Verb (-s/-es) + Complement',
'She eats an apple every morning.',
'[{"titulo":"I / You / We / They","verbo":"PLAY","nota":"Every Saturday"},{"titulo":"He / She / It","verbo":"PLAYS","nota":"Adds -s / -ses e.g. works, studies"},{"titulo":"FORMULA","verbo":"S + Verb(-s) + Complement","nota":"e.g. She eats an apple."}]'::jsonb,
ARRAY['Sujeto','Verbo','Complemento','Complemento']
WHERE NOT EXISTS (SELECT 1 FROM gramatica WHERE id_leccion = '1');

INSERT INTO construccion_oracion (id_leccion, oracion_espanol, respuesta_correcta, orden)
SELECT '1', c.* FROM (VALUES
    ('El trabaja todos los dias',        'He works every day', 1),
    ('Ella corre en el parque',          'She runs in the park', 2),
    ('Ellos estudian ingles',            'They study English', 3)
) AS c(es, en, ord)
WHERE NOT EXISTS (SELECT 1 FROM construccion_oracion WHERE id_leccion = '1' LIMIT 1);

INSERT INTO palabra_construccion (id_construccion, palabra, orden_correcto)
SELECT c.id_construccion, p.palabra, p.ord_correcto
FROM construccion_oracion c
CROSS JOIN (VALUES
    (1, 'He',    1), (1, 'works', 2), (1, 'every', 3), (1, 'day',   4),
    (2, 'She',   1), (2, 'runs',  2), (2, 'in',    3), (2, 'the',   4), (2, 'park', 5),
    (3, 'They',  1), (3, 'study', 2), (3, 'English', 3)
) AS p(constr_id, palabra, ord_correcto)
WHERE c.orden = p.constr_id
  AND c.id_leccion = '1'
  AND NOT EXISTS (SELECT 1 FROM palabra_construccion pc WHERE pc.id_construccion = c.id_construccion LIMIT 1);

INSERT INTO pronunciacion (id_leccion, oracion_ingles, orden)
SELECT '1', p.* FROM (VALUES
    ('He works every day', 1),
    ('She runs in the park', 2)
) AS p(oracion, ord)
WHERE NOT EXISTS (SELECT 1 FROM pronunciacion WHERE id_leccion = '1' LIMIT 1);

INSERT INTO evaluacion (id_evaluacion, id_leccion)
SELECT 1, '1'
WHERE NOT EXISTS (SELECT 1 FROM evaluacion WHERE id_leccion = '1');

INSERT INTO pregunta (id_evaluacion, enunciado,
    alternativa_a, alternativa_b, alternativa_c, alternativa_d,
    respuesta_correcta, orden)
SELECT 1, p.* FROM (VALUES
    ('Elige el verbo correcto: ''She ____ English very well.''', 'studies', 'study', 'studying', 'studis', 'A', 1),
    ('Completa la oracion: ''We ____ to the radio every morning.''', 'hears', 'listens', 'listen', 'listening', 'C', 2),
    ('Completa la oracion: ''My father ____ coffee in the office.''', 'drinks', 'drinking', 'drink', 'drinked', 'A', 3),
    ('Selecciona la forma correcta: ''They ____ soccer on weekends.''', 'plays', 'play', 'playing', 'playes', 'B', 4),
    ('Completa la oracion: ''He ____ to school at 7:30 AM.''', 'goes', 'go', 'going', 'went', 'A', 5),
    ('Completa el espacio: ''I ____ an apple every afternoon.''', 'eats', 'eat', 'eating', 'ate', 'B', 6),
    ('Escoge el correcto: ''The cat ____ under the table.''', 'sleeps', 'sleep', 'sleeping', 'sleeped', 'A', 7),
    ('Completa: ''You ____ books in the library.''', 'reads', 'read', 'reading', 'reader', 'B', 8),
    ('Elige la opcion correcta: ''The sun ____ in the east.''', 'rise', 'rises', 'rising', 'rised', 'B', 9),
    ('Completa la oracion: ''We ____ letters to our friends.''', 'writes', 'write', 'writing', 'writed', 'B', 10)
) AS p(enunciado, a, b, c, d, correcta, ord)
WHERE NOT EXISTS (SELECT 1 FROM pregunta WHERE id_evaluacion = 1 LIMIT 1);

-- Leccion 2: Present Continuous
INSERT INTO leccion (id_leccion, id_docente, titulo, estado_activo)
SELECT '2', id_docente, 'Present Continuous - Acciones en Progreso', FALSE
FROM docente WHERE id_docente = (SELECT id_docente FROM docente LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM leccion WHERE id_leccion = '2');

INSERT INTO vocabulario (id_leccion, palabra_ingles, traduccion_espanol, orden)
SELECT '2', v.* FROM (VALUES
    ('teaching', 'ensenando', 1),
    ('learning', 'aprendiendo', 2),
    ('eating',   'comiendo', 3),
    ('sleeping', 'durmiendo', 4),
    ('coding',   'programando', 5)
) AS v(palabra, trad, ord)
WHERE NOT EXISTS (SELECT 1 FROM vocabulario WHERE id_leccion = '2' LIMIT 1);

INSERT INTO gramatica (id_leccion, nombre_tema, explicacion, formula, ejemplo, gramatica_columnas, ejemplo_roles)
SELECT '2', 'PRESENT CONTINUOUS',
'El Present Continuous se usa para acciones que estan ocurriendo ahora mismo en el momento de hablar. Se forma con el verbo to be (am/is/are) + verbo con -ing.',
'Subject + am/is/are + Verb(-ing) + Complement',
'I am reading a book right now.',
'[{"titulo":"I","verbo":"am","nota":"Sujeto"},{"titulo":"He/She/It","verbo":"is","nota":"Sujeto"},{"titulo":"You/We/They","verbo":"are","nota":"Sujeto"},{"titulo":"FORMULA","verbo":"S + Be + V(-ing) + C","nota":"e.g. I am reading a book."}]'::jsonb,
ARRAY['Sujeto','Verbo','Complemento']
WHERE NOT EXISTS (SELECT 1 FROM gramatica WHERE id_leccion = '2');

INSERT INTO construccion_oracion (id_leccion, oracion_espanol, respuesta_correcta, orden)
SELECT '2', c.* FROM (VALUES
    ('Estoy escribiendo un ensayo',               'I am writing an essay', 1),
    ('Ellos estan aprendiendo ingles',            'They are learning English', 2)
) AS c(es, en, ord)
WHERE NOT EXISTS (SELECT 1 FROM construccion_oracion WHERE id_leccion = '2' LIMIT 1);

INSERT INTO palabra_construccion (id_construccion, palabra, orden_correcto)
SELECT c.id_construccion, p.palabra, p.ord_correcto
FROM construccion_oracion c
CROSS JOIN (VALUES
    (1, 'I',       1), (1, 'am',      2), (1, 'writing', 3), (1, 'an',      4), (1, 'essay',   5),
    (2, 'They',    1), (2, 'are',     2), (2, 'learning', 3), (2, 'English', 4)
) AS p(constr_id, palabra, ord_correcto)
WHERE c.orden = p.constr_id
  AND c.id_leccion = '2'
  AND NOT EXISTS (SELECT 1 FROM palabra_construccion pc WHERE pc.id_construccion = c.id_construccion LIMIT 1);

INSERT INTO pronunciacion (id_leccion, oracion_ingles, orden)
SELECT '2', p.* FROM (VALUES
    ('They are learning English', 1),
    ('I am writing an essay', 2)
) AS p(oracion, ord)
WHERE NOT EXISTS (SELECT 1 FROM pronunciacion WHERE id_leccion = '2' LIMIT 1);

INSERT INTO evaluacion (id_evaluacion, id_leccion)
SELECT 2, '2'
WHERE NOT EXISTS (SELECT 1 FROM evaluacion WHERE id_leccion = '2');

INSERT INTO pregunta (id_evaluacion, enunciado,
    alternativa_a, alternativa_b, alternativa_c, alternativa_d,
    respuesta_correcta, orden)
SELECT 2, p.* FROM (VALUES
    ('Completa: ''My teacher ____ talking right now.''', 'is', 'are', 'am', 'be', 'A', 1),
    ('What are they doing? ''They ____ soccer in the yard.''', 'is playing', 'playing', 'are playing', 'are play', 'C', 2),
    ('Completa la oracion: ''I ____ learning how to cook.''', 'am', 'is', 'are', 'be', 'A', 3),
    ('Completa: ''They are ____ a fantastic new book.''', 'read', 'reading', 'reads', 'readed', 'B', 4),
    ('Elige la forma correcta: ''Look! She ____ in the pool.''', 'is swimming', 'swimming', 'are swimming', 'swim', 'A', 5),
    ('Completa: ''Listen! The baby ____ right now.''', 'is crying', 'are crying', 'crying', 'cry', 'A', 6),
    ('Completa la oracion: ''We ____ watching a funny movie.''', 'is', 'are', 'am', 'be', 'B', 7),
    ('Selecciona el verbo correcto: ''He is ____ some orange juice.''', 'drink', 'drinking', 'drinks', 'drank', 'B', 8),
    ('Completa la pregunta: ''Why are you ____?''', 'runs', 'running', 'run', 'ran', 'B', 9),
    ('Completa: ''The students ____ studying for the exam.''', 'is', 'are', 'am', 'was', 'B', 10)
) AS p(enunciado, a, b, c, d, correcta, ord)
WHERE NOT EXISTS (SELECT 1 FROM pregunta WHERE id_evaluacion = 2 LIMIT 1);

-- ============================================
-- VERIFICACION
-- ============================================
-- Despues de ejecutar, proba:
--   estudiante / 1234
--   docente / 1234
-- ============================================
