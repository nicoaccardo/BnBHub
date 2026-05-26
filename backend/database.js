const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error(err.message);
  else console.log('Connesso al database SQLite');
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

module.exports = db;
