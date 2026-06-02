const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const databasePath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error('Errore connessione database:', err.message);
  }
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

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
      intolleranze TEXT,
      note_ospite TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (utente_id) REFERENCES users(id),
      FOREIGN KEY (camera_id) REFERENCES rooms(id)
    )
  `);

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
});

module.exports = db;
