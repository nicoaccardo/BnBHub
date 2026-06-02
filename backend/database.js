const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    eta INTEGER,
    telefono TEXT,
    codice_fiscale TEXT UNIQUE,
    ruolo TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descrizione TEXT,
    tipo TEXT NOT NULL,
    prezzo REAL NOT NULL,
    capienza INTEGER NOT NULL,
    disponibile INTEGER DEFAULT 1,
    immagine_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utente_id INTEGER NOT NULL,
    camera_id INTEGER NOT NULL,
    data_inizio TEXT NOT NULL,
    data_fine TEXT NOT NULL,
    stato TEXT DEFAULT 'in attesa',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (utente_id) REFERENCES users(id),
    FOREIGN KEY (camera_id) REFERENCES rooms(id)
  )
`);

db.run(`ALTER TABLE bookings ADD COLUMN intolleranze TEXT`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error(err.message);
  }
});

db.run(`ALTER TABLE bookings ADD COLUMN note_ospite TEXT`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error(err.message);
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL UNIQUE,
    utente_id INTEGER NOT NULL,
    camera_id INTEGER NOT NULL,
    voto INTEGER NOT NULL,
    testo TEXT NOT NULL,
    visibile INTEGER DEFAULT 0,
    stato TEXT DEFAULT 'in attesa',
    motivo_rifiuto TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (utente_id) REFERENCES users(id),
    FOREIGN KEY (camera_id) REFERENCES rooms(id)
  )
`);

db.run(`ALTER TABLE reviews ADD COLUMN stato TEXT DEFAULT 'in attesa'`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error(err.message);
  }
});

db.run(`ALTER TABLE reviews ADD COLUMN motivo_rifiuto TEXT`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error(err.message);
  }
});

db.run(`
  UPDATE reviews
  SET stato = CASE
    WHEN visibile = 1 THEN 'pubblicata'
    ELSE 'in attesa'
  END
  WHERE stato IS NULL OR stato = ''
`);

db.run(`
  UPDATE reviews
  SET visibile = CASE
    WHEN stato = 'pubblicata' THEN 1
    ELSE 0
  END
  WHERE stato IN ('in attesa', 'pubblicata', 'rifiutata')
`);

module.exports = db;
