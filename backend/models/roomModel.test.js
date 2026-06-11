const assert = require('node:assert/strict');
const test = require('node:test');
const sqlite3 = require('sqlite3').verbose();
const { createRoomModel } = require('./roomModel');

function run(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function getDisponibili(model, filters) {
  return new Promise((resolve, reject) => {
    model.getDisponibili(filters, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

test('availability excludes disabled, undersized and overlapping rooms', async (t) => {
  const database = new sqlite3.Database(':memory:');
  const model = createRoomModel(database);
  t.after(() => database.close());

  await run(database, `
    CREATE TABLE rooms (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      descrizione TEXT,
      tipo TEXT NOT NULL,
      prezzo REAL NOT NULL,
      capienza INTEGER NOT NULL,
      disponibile INTEGER NOT NULL,
      immagine_url TEXT
    )
  `);
  await run(database, `
    CREATE TABLE room_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      ordine INTEGER NOT NULL DEFAULT 0
    )
  `);
  await run(database, `
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      camera_id INTEGER NOT NULL,
      data_inizio TEXT NOT NULL,
      data_fine TEXT NOT NULL,
      stato TEXT NOT NULL
    )
  `);

  const rooms = [
    [1, 'Libera', 2, 1],
    [2, 'Occupata', 2, 1],
    [3, 'Disabilitata', 2, 0],
    [4, 'Troppo piccola', 1, 1],
    [5, 'Cancellata', 2, 1],
    [6, 'Adiacente', 2, 1]
  ];

  for (const [id, nome, capienza, disponibile] of rooms) {
    await run(
      database,
      `INSERT INTO rooms
       (id, nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url)
       VALUES (?, ?, '', 'doppia', 100, ?, ?, NULL)`,
      [id, nome, capienza, disponibile]
    );
  }

  await run(
    database,
    `INSERT INTO bookings (camera_id, data_inizio, data_fine, stato)
     VALUES (2, '2026-08-12', '2026-08-14', 'confermata')`
  );
  await run(
    database,
    `INSERT INTO bookings (camera_id, data_inizio, data_fine, stato)
     VALUES (5, '2026-08-12', '2026-08-14', 'cancellata')`
  );
  await run(
    database,
    `INSERT INTO bookings (camera_id, data_inizio, data_fine, stato)
     VALUES (6, '2026-08-15', '2026-08-17', 'in attesa')`
  );

  const availableRooms = await getDisponibili(model, {
    data_inizio: '2026-08-10',
    data_fine: '2026-08-15',
    ospiti: 2
  });

  assert.deepEqual(
    availableRooms.map((room) => room.id).sort(),
    [1, 5, 6]
  );
});
