export const databaseVersion = 4;

export const migrationSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  photo_uri TEXT,
  escala_notas_padrao TEXT NOT NULL DEFAULT '0-20',
  nota_minima_padrao REAL NOT NULL DEFAULT 10,
  fuso_horario TEXT NOT NULL DEFAULT 'Europe/Lisbon',
  notificacoes_ativas INTEGER NOT NULL DEFAULT 1,
  idioma TEXT NOT NULL DEFAULT 'pt',
  formato_data TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  tema TEXT NOT NULL DEFAULT 'auto'
);

CREATE TABLE IF NOT EXISTS curso (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  instituicao TEXT,
  data_inicio TEXT NOT NULL,
  data_fim_prevista TEXT,
  escala_notas TEXT NOT NULL DEFAULT '0-20',
  nota_minima_aprovacao REAL NOT NULL DEFAULT 10,
  total_semestres INTEGER,
  total_ects REAL,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS semester (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id INTEGER,
  title TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  notes TEXT,
  meta_media REAL,
  meta_ects REAL,
  FOREIGN KEY (curso_id) REFERENCES curso(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS uc (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'functions',
  ects REAL NOT NULL DEFAULT 0,
  professores TEXT,
  notes TEXT,
  escala_notas TEXT,
  nota_minima_aprovacao REAL,
  tem_exame_recurso INTEGER NOT NULL DEFAULT 0,
  peso_minimo_prova REAL,
  link_uc TEXT,
  FOREIGN KEY (semester_id) REFERENCES semester(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS avaliacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uc_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  peso REAL NOT NULL,
  nota_obtida REAL,
  nota_maxima REAL,
  lembrete_ativo INTEGER NOT NULL DEFAULT 0,
  lembrete_antecedencia TEXT,
  anexo_url TEXT,
  notas TEXT,
  FOREIGN KEY (uc_id) REFERENCES uc(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  semester_id INTEGER,
  uc_id INTEGER,
  title TEXT NOT NULL,
  date_time TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  completed INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  tipo TEXT NOT NULL DEFAULT 'evento',
  FOREIGN KEY (semester_id) REFERENCES semester(id) ON DELETE SET NULL,
  FOREIGN KEY (uc_id) REFERENCES uc(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_semester_dates ON semester(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_avaliacao_data_hora ON avaliacao(data_hora);
CREATE INDEX IF NOT EXISTS idx_avaliacao_uc_id ON avaliacao(uc_id);
CREATE INDEX IF NOT EXISTS idx_event_date_time ON event(date_time);
`;

export const exportTableNames = [
  'user_profile',
  'curso',
  'semester',
  'uc',
  'avaliacao',
  'event',
] as const;
