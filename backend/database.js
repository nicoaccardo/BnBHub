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

module.exports = db;