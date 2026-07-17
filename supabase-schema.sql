-- ============================================
-- Esquema para unajma-learn-english
-- Pegar esto en SQL Editor de Supabase
-- ============================================

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS lecciones (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa',
  lista_vocabulario TEXT[] DEFAULT '{}',
  imagen_gramatica TEXT,
  formula_gramatica TEXT,
  ejemplo_oracion TEXT,
  ejemplo_roles TEXT[] DEFAULT '{}',
  calentamiento JSONB DEFAULT '[]',
  evaluacion JSONB DEFAULT '[]',
  frases_pronunciacion TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante TEXT NOT NULL,
  leccion_id TEXT NOT NULL REFERENCES lecciones(id),
  leccion_titulo TEXT NOT NULL,
  nota NUMERIC(4,1) NOT NULL,
  fecha TEXT NOT NULL,
  aciertos INTEGER NOT NULL,
  total_preguntas INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) — modo apertura para desarrollo
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública lecciones"
  ON lecciones FOR SELECT USING (true);

CREATE POLICY "Lectura pública calificaciones"
  ON calificaciones FOR SELECT USING (true);

CREATE POLICY "Inserción pública calificaciones"
  ON calificaciones FOR INSERT WITH CHECK (true);
