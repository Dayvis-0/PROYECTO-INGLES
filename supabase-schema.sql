-- ============================================
-- Esquema completo + datos iniciales
-- Pegar TODO en SQL Editor de Supabase y ejecutar
-- ============================================

-- ==================== BORRAR TODO (para poder ejecutar多次) ====================

DROP TABLE IF EXISTS palabra_construccion  CASCADE;
DROP TABLE IF EXISTS pregunta              CASCADE;
DROP TABLE IF EXISTS resultado             CASCADE;
DROP TABLE IF EXISTS construccion_oracion  CASCADE;
DROP TABLE IF EXISTS vocabulario           CASCADE;
DROP TABLE IF EXISTS gramatica             CASCADE;
DROP TABLE IF EXISTS pronunciacion         CASCADE;
DROP TABLE IF EXISTS evaluacion            CASCADE;
DROP TABLE IF EXISTS leccion               CASCADE;
DROP TABLE IF EXISTS estudiante            CASCADE;
DROP TABLE IF EXISTS docente               CASCADE;
DROP TABLE IF EXISTS usuario               CASCADE;

-- ==================== TABLAS ====================

CREATE TABLE usuario (
    id_usuario      SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(30) NOT NULL,
    nombre_usuario  VARCHAR(25) UNIQUE NOT NULL,
    auth_uid        UUID UNIQUE REFERENCES auth.users(id),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE docente (
    id_docente  SERIAL PRIMARY KEY,
    id_usuario  INT NOT NULL UNIQUE,
    CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE estudiante (
    id_estudiante SERIAL PRIMARY KEY,
    id_usuario    INT NOT NULL UNIQUE,
    CONSTRAINT fk_estudiante_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE leccion (
    id_leccion     TEXT PRIMARY KEY,
    id_docente     INT NOT NULL,
    titulo         VARCHAR(80) NOT NULL,
    estado_activo  BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_leccion_docente FOREIGN KEY (id_docente)
        REFERENCES docente(id_docente)
);

CREATE TABLE vocabulario (
    id_vocabulario      SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL,
    palabra_ingles      VARCHAR(100) NOT NULL,
    traduccion_espanol  VARCHAR(100) NOT NULL,
    url_audio           VARCHAR(500),
    orden               SMALLINT NOT NULL,
    CONSTRAINT fk_vocabulario_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE gramatica (
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

CREATE TABLE construccion_oracion (
    id_construccion     SERIAL PRIMARY KEY,
    id_leccion          TEXT NOT NULL,
    oracion_espanol     TEXT NOT NULL,
    respuesta_correcta  TEXT NOT NULL,
    orden               SMALLINT NOT NULL,
    CONSTRAINT fk_construccion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE palabra_construccion (
    id_palabra       SERIAL PRIMARY KEY,
    id_construccion  INT NOT NULL,
    palabra          VARCHAR(100) NOT NULL,
    orden_correcto   SMALLINT NOT NULL,
    CONSTRAINT fk_palabra_construccion FOREIGN KEY (id_construccion)
        REFERENCES construccion_oracion(id_construccion)
);

CREATE TABLE pronunciacion (
    id_pronunciacion  SERIAL PRIMARY KEY,
    id_leccion        TEXT NOT NULL,
    oracion_ingles    TEXT NOT NULL,
    orden             SMALLINT NOT NULL,
    CONSTRAINT fk_pronunciacion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE evaluacion (
    id_evaluacion  SERIAL PRIMARY KEY,
    id_leccion     TEXT NOT NULL UNIQUE,
    CONSTRAINT fk_evaluacion_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion)
);

CREATE TABLE pregunta (
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

CREATE TABLE resultado (
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

-- ==================== RLS (seguro — basado en auth.uid() y roles) ====================

ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE docente ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiante ENABLE ROW LEVEL SECURITY;
ALTER TABLE leccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulario ENABLE ROW LEVEL SECURITY;
ALTER TABLE gramatica ENABLE ROW LEVEL SECURITY;
ALTER TABLE construccion_oracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE palabra_construccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregunta ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultado ENABLE ROW LEVEL SECURITY;

-- ==================== Helper: es docente? ====================
-- Función reutilizable para políticas
CREATE OR REPLACE FUNCTION public.is_docente()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM docente d
        JOIN usuario u ON u.id_usuario = d.id_usuario
        WHERE u.auth_uid = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==================== Helper: es estudiante? ====================
CREATE OR REPLACE FUNCTION public.is_estudiante()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM estudiante e
        JOIN usuario u ON u.id_usuario = e.id_usuario
        WHERE u.auth_uid = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==================== usuario ====================
-- El usuario puede leer/actualizar su propio registro.
-- Los docentes pueden leer TODOS los usuarios (para monitoreo de calificaciones).
CREATE POLICY "usuario_select_own_or_docente" ON usuario
    FOR SELECT USING (
        auth_uid = auth.uid()
        OR public.is_docente()
    );
CREATE POLICY "usuario_update_own" ON usuario
    FOR UPDATE USING (auth_uid = auth.uid()) WITH CHECK (auth_uid = auth.uid());

-- ==================== docente ====================
CREATE POLICY "docente_select_auth" ON docente
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "docente_insert_own" ON docente
    FOR INSERT WITH CHECK (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()));
CREATE POLICY "docente_update_own" ON docente
    FOR UPDATE USING (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()))
    WITH CHECK (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()));
CREATE POLICY "docente_delete_own" ON docente
    FOR DELETE USING (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()));

-- ==================== estudiante ====================
CREATE POLICY "estudiante_select_auth" ON estudiante
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "estudiante_insert_own" ON estudiante
    FOR INSERT WITH CHECK (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()));
CREATE POLICY "estudiante_update_own" ON estudiante
    FOR UPDATE USING (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()))
    WITH CHECK (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()));
CREATE POLICY "estudiante_delete_own" ON estudiante
    FOR DELETE USING (id_usuario IN (SELECT id_usuario FROM usuario WHERE auth_uid = auth.uid()));

-- ==================== leccion ====================
CREATE POLICY "leccion_select_auth" ON leccion
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "leccion_insert_docente" ON leccion
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "leccion_update_docente" ON leccion
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "leccion_delete_docente" ON leccion
    FOR DELETE USING (public.is_docente());

-- ==================== vocabulario ====================
CREATE POLICY "vocabulario_select_auth" ON vocabulario
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "vocabulario_insert_docente" ON vocabulario
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "vocabulario_update_docente" ON vocabulario
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "vocabulario_delete_docente" ON vocabulario
    FOR DELETE USING (public.is_docente());

-- ==================== gramatica ====================
CREATE POLICY "gramatica_select_auth" ON gramatica
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "gramatica_insert_docente" ON gramatica
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "gramatica_update_docente" ON gramatica
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "gramatica_delete_docente" ON gramatica
    FOR DELETE USING (public.is_docente());

-- ==================== construccion_oracion ====================
CREATE POLICY "construccion_select_auth" ON construccion_oracion
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "construccion_insert_docente" ON construccion_oracion
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "construccion_update_docente" ON construccion_oracion
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "construccion_delete_docente" ON construccion_oracion
    FOR DELETE USING (public.is_docente());

-- ==================== palabra_construccion ====================
CREATE POLICY "palabra_select_auth" ON palabra_construccion
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "palabra_insert_docente" ON palabra_construccion
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "palabra_update_docente" ON palabra_construccion
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "palabra_delete_docente" ON palabra_construccion
    FOR DELETE USING (public.is_docente());

-- ==================== pronunciacion ====================
CREATE POLICY "pronunciacion_select_auth" ON pronunciacion
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pronunciacion_insert_docente" ON pronunciacion
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "pronunciacion_update_docente" ON pronunciacion
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "pronunciacion_delete_docente" ON pronunciacion
    FOR DELETE USING (public.is_docente());

-- ==================== evaluacion ====================
CREATE POLICY "evaluacion_select_auth" ON evaluacion
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "evaluacion_insert_docente" ON evaluacion
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "evaluacion_update_docente" ON evaluacion
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "evaluacion_delete_docente" ON evaluacion
    FOR DELETE USING (public.is_docente());

-- ==================== pregunta ====================
CREATE POLICY "pregunta_select_auth" ON pregunta
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "pregunta_insert_docente" ON pregunta
    FOR INSERT WITH CHECK (public.is_docente());
CREATE POLICY "pregunta_update_docente" ON pregunta
    FOR UPDATE USING (public.is_docente()) WITH CHECK (public.is_docente());
CREATE POLICY "pregunta_delete_docente" ON pregunta
    FOR DELETE USING (public.is_docente());

-- ==================== resultado ====================
CREATE POLICY "resultado_select_own_or_docente" ON resultado
    FOR SELECT USING (
        id_estudiante IN (SELECT e.id_estudiante FROM estudiante e JOIN usuario u ON u.id_usuario = e.id_usuario WHERE u.auth_uid = auth.uid())
        OR public.is_docente()
    );
CREATE POLICY "resultado_insert_own" ON resultado
    FOR INSERT WITH CHECK (
        id_estudiante IN (SELECT e.id_estudiante FROM estudiante e JOIN usuario u ON u.id_usuario = e.id_usuario WHERE u.auth_uid = auth.uid())
    );
CREATE POLICY "resultado_update_own" ON resultado
    FOR UPDATE USING (
        id_estudiante IN (SELECT e.id_estudiante FROM estudiante e JOIN usuario u ON u.id_usuario = e.id_usuario WHERE u.auth_uid = auth.uid())
    ) WITH CHECK (
        id_estudiante IN (SELECT e.id_estudiante FROM estudiante e JOIN usuario u ON u.id_usuario = e.id_usuario WHERE u.auth_uid = auth.uid())
    );

-- ==================== DATOS INICIALES ====================

-- 1. USUARIOS
INSERT INTO usuario (nombre_completo, nombre_usuario) VALUES
('Estudiante', 'estudiante'),
('Docente', 'docente');

-- 2. CREAR USUARIOS EN SUPABASE AUTH (para que login funcione)
-- Contraseña para ambos: 1234
-- Email: {nombre_usuario}@learn-english.app
DO $$
DECLARE
    user_record RECORD;
    new_user_id UUID;
BEGIN
    FOR user_record IN SELECT * FROM usuario WHERE auth_uid IS NULL
    LOOP
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, confirmation_token, recovery_token,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_sent_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            user_record.nombre_usuario || '@learn-english.app',
            crypt('1234', gen_salt('bf')),
            NOW(), '', '',
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('nombre_usuario', user_record.nombre_usuario, 'nombre_completo', user_record.nombre_completo),
            NOW(), NOW(),
            NOW()
        )
        RETURNING id INTO new_user_id;

        UPDATE usuario SET auth_uid = new_user_id WHERE id_usuario = user_record.id_usuario;
    END LOOP;
END $$;

-- 3. DOCENTE (id_usuario = 2)
INSERT INTO docente (id_usuario) VALUES (2);

-- 4. ESTUDIANTES (id_usuario = 1)
INSERT INTO estudiante (id_usuario) VALUES (1);

-- ==================== LECCIÓN 1: PRESENT SIMPLE ====================

-- 4. LECCION 1
INSERT INTO leccion (id_leccion, id_docente, titulo, estado_activo)
VALUES (1, 1, 'Present Simple - Rutinas Diarias', TRUE);

-- 5. VOCABULARIO
INSERT INTO vocabulario (id_leccion, palabra_ingles, traduccion_espanol, orden) VALUES
(1, 'eat',    'comer',    1),
(1, 'drink',  'beber',    2),
(1, 'work',   'trabajar', 3),
(1, 'run',    'correr',   4),
(1, 'read',   'leer',     5),
(1, 'write',  'escribir', 6);

-- 6. GRAMATICA
INSERT INTO gramatica (id_leccion, nombre_tema, explicacion, formula, ejemplo, gramatica_columnas, ejemplo_roles)
VALUES (1, 'PRESENT SIMPLE',
'El Present Simple se usa para hablar de rutinas, hábitos y hechos permanentes. Para he/she/it se agrega -s o -es al verbo.',
'Subject + Verb (-s/-es) + Complement',
'She eats an apple every morning.',
'[{"titulo":"I / You / We / They","verbo":"PLAY","nota":"Every Saturday"},{"titulo":"He / She / It","verbo":"PLAYS","nota":"Adds -s / -es\\ne.g. works, studies"},{"titulo":"FORMULA","verbo":"S + Verb(-s) + Complement","nota":"e.g. She eats an apple."}]'::jsonb,
ARRAY['Sujeto','Verbo','Complemento','Complemento']);

-- 7. CONSTRUCCION DE ORACIONES (calentamiento)
INSERT INTO construccion_oracion (id_leccion, oracion_espanol, respuesta_correcta, orden) VALUES
(1, 'Él trabaja todos los días',        'He works every day', 1),
(1, 'Ella corre en el parque',          'She runs in the park', 2),
(1, 'Ellos estudian inglés',            'They study English', 3);

-- 8. PALABRAS para cada construcción
INSERT INTO palabra_construccion (id_construccion, palabra, orden_correcto) VALUES
-- "He works every day"
(1, 'He',    1),
(1, 'works', 2),
(1, 'every', 3),
(1, 'day',   4),
-- "She runs in the park"
(2, 'She',  1),
(2, 'runs', 2),
(2, 'in',   3),
(2, 'the',  4),
(2, 'park', 5),
-- "They study English"
(3, 'They',   1),
(3, 'study',  2),
(3, 'English', 3);

-- 9. PRONUNCIACION
INSERT INTO pronunciacion (id_leccion, oracion_ingles, orden) VALUES
(1, 'He works every day', 1),
(1, 'She runs in the park', 2);

-- 10. EVALUACION
INSERT INTO evaluacion (id_evaluacion, id_leccion) VALUES (1, 1);

-- 11. PREGUNTAS
INSERT INTO pregunta (id_evaluacion, enunciado,
    alternativa_a, alternativa_b, alternativa_c, alternativa_d,
    respuesta_correcta, orden) VALUES
(1,
'Elige el verbo correcto: ''She ____ English very well.''',
'studies', 'study', 'studying', 'studis',
'A', 1),

(1,
'Completa la oración: ''We ____ to the radio every morning.''',
'hears', 'listens', 'listen', 'listening',
'C', 2),

(1,
'Completa la oración: ''My father ____ coffee in the office.''',
'drinks', 'drinking', 'drink', 'drinked',
'A', 3),

(1,
'Selecciona la forma correcta: ''They ____ soccer on weekends.''',
'plays', 'play', 'playing', 'playes',
'B', 4),

(1,
'Completa la oración: ''He ____ to school at 7:30 AM.''',
'goes', 'go', 'going', 'went',
'A', 5),

(1,
'Completa el espacio: ''I ____ an apple every afternoon.''',
'eats', 'eat', 'eating', 'ate',
'B', 6),

(1,
'Escoge el correcto: ''The cat ____ under the table.''',
'sleeps', 'sleep', 'sleeping', 'sleeped',
'A', 7),

(1,
'Completa: ''You ____ books in the library.''',
'reads', 'read', 'reading', 'reader',
'B', 8),

(1,
'Elige la opción correcta: ''The sun ____ in the east.''',
'rise', 'rises', 'rising', 'rised',
'B', 9),

(1,
'Completa la oración: ''We ____ letters to our friends.''',
'writes', 'write', 'writing', 'writed',
'B', 10);

-- ==================== LECCIÓN 2: PRESENT CONTINUOUS ====================

INSERT INTO leccion (id_leccion, id_docente, titulo, estado_activo)
VALUES (2, 1, 'Present Continuous - Acciones en Progreso', FALSE);

INSERT INTO vocabulario (id_leccion, palabra_ingles, traduccion_espanol, orden) VALUES
(2, 'teaching', 'enseñando', 1),
(2, 'learning', 'aprendiendo', 2),
(2, 'eating',   'comiendo', 3),
(2, 'sleeping', 'durmiendo', 4),
(2, 'coding',   'programando', 5);

INSERT INTO gramatica (id_leccion, nombre_tema, explicacion, formula, ejemplo, gramatica_columnas, ejemplo_roles)
VALUES (2, 'PRESENT CONTINUOUS',
'El Present Continuous se usa para acciones que están ocurriendo ahora mismo en el momento de hablar. Se forma con el verbo to be (am/is/are) + verbo con -ing.',
'Subject + am/is/are + Verb(-ing) + Complement',
'I am reading a book right now.',
'[{"titulo":"I","verbo":"am","nota":"Sujeto"},{"titulo":"He/She/It","verbo":"is","nota":"Sujeto"},{"titulo":"You/We/They","verbo":"are","nota":"Sujeto"},{"titulo":"FORMULA","verbo":"S + Be + V(-ing) + C","nota":"e.g. I am reading a book."}]'::jsonb,
ARRAY['Sujeto','Verbo','Complemento']);

INSERT INTO construccion_oracion (id_leccion, oracion_espanol, respuesta_correcta, orden) VALUES
(2, 'Estoy escribiendo un ensayo',               'I am writing an essay', 1),
(2, 'Ellos están aprendiendo inglés',            'They are learning English', 2);

INSERT INTO palabra_construccion (id_construccion, palabra, orden_correcto) VALUES
-- "I am writing an essay"
(4, 'I',       1),
(4, 'am',      2),
(4, 'writing', 3),
(4, 'an',      4),
(4, 'essay',   5),
-- "They are learning English"
(5, 'They',    1),
(5, 'are',     2),
(5, 'learning', 3),
(5, 'English', 4);

INSERT INTO pronunciacion (id_leccion, oracion_ingles, orden) VALUES
(2, 'They are learning English', 1),
(2, 'I am writing an essay', 2);

INSERT INTO evaluacion (id_evaluacion, id_leccion) VALUES (2, 2);

INSERT INTO pregunta (id_evaluacion, enunciado,
    alternativa_a, alternativa_b, alternativa_c, alternativa_d,
    respuesta_correcta, orden) VALUES
(2,
'Completa: ''My teacher ____ talking right now.''',
'is', 'are', 'am', 'be',
'A', 1),

(2,
'What are they doing? ''They ____ soccer in the yard.''',
'is playing', 'playing', 'are playing', 'are play',
'C', 2),

(2,
'Completa la oración: ''I ____ learning how to cook.''',
'am', 'is', 'are', 'be',
'A', 3),

(2,
'Completa: ''They are ____ a fantastic new book.''',
'read', 'reading', 'reads', 'readed',
'B', 4),

(2,
'Elige la forma correcta: ''Look! She ____ in the pool.''',
'is swimming', 'swimming', 'are swimming', 'swim',
'A', 5),

(2,
'Completa: ''Listen! The baby ____ right now.''',
'is crying', 'are crying', 'crying', 'cry',
'A', 6),

(2,
'Completa la oración: ''We ____ watching a funny movie.''',
'is', 'are', 'am', 'be',
'B', 7),

(2,
'Selecciona el verbo correcto: ''He is ____ some orange juice.''',
'drink', 'drinking', 'drinks', 'drank',
'B', 8),

(2,
'Completa la pregunta: ''Why are you ____?''',
'runs', 'running', 'run', 'ran',
'B', 9),

(2,
'Completa: ''The students ____ studying for the exam.''',
'is', 'are', 'am', 'was',
'B', 10);
