const assert = require('node:assert/strict');
const test = require('node:test');
const sqlite3 = require('sqlite3').verbose();
const { createBookingModel } = require('./bookingModel');

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

function createIfAvailable(model, booking) {
  return new Promise((resolve, reject) => {
    model.createIfAvailable(booking, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

test('concurrent overlapping bookings insert only one row', async (t) => {
  const database = new sqlite3.Database(':memory:');
  const model = createBookingModel(database);
  t.after(() => database.close());

  await run(database, `
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utente_id INTEGER NOT NULL,
      camera_id INTEGER NOT NULL,
      data_inizio TEXT NOT NULL,
      data_fine TEXT NOT NULL,
      stato TEXT NOT NULL
    )
  `);

  const baseBooking = {
    camera_id: 4,
    data_inizio: '2026-08-10',
    data_fine: '2026-08-15',
    stato: 'in attesa'
  };
  const results = await Promise.all([
    createIfAvailable(model, { ...baseBooking, utente_id: 1 }),
    createIfAvailable(model, { ...baseBooking, utente_id: 2 })
  ]);

  assert.deepEqual(
    results.map((result) => result.changes).sort(),
    [0, 1]
  );

  const count = await new Promise((resolve, reject) => {
    database.get('SELECT COUNT(*) AS total FROM bookings', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.total);
    });
  });
  assert.equal(count, 1);
});

test('user-scoped updates cannot modify another users booking', async (t) => {
  const database = new sqlite3.Database(':memory:');
  const model = createBookingModel(database);
  t.after(() => database.close());

  await run(database, `
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utente_id INTEGER NOT NULL,
      camera_id INTEGER NOT NULL,
      data_inizio TEXT NOT NULL,
      data_fine TEXT NOT NULL,
      stato TEXT NOT NULL,
      intolleranze TEXT,
      note_ospite TEXT
    )
  `);
  const inserted = await run(
    database,
    `INSERT INTO bookings
     (utente_id, camera_id, data_inizio, data_fine, stato, intolleranze, note_ospite)
     VALUES (1, 4, '2026-08-10', '2026-08-15', 'confermata', '', '')`
  );

  const cancellation = await new Promise((resolve, reject) => {
    model.cancelByUser(inserted.lastID, 2, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ changes: this.changes });
    });
  });
  const guestInfoUpdate = await new Promise((resolve, reject) => {
    model.updateGuestInfo(
      inserted.lastID,
      2,
      { intolleranze: 'glutine', note_ospite: 'nota' },
      function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({ changes: this.changes });
      }
    );
  });

  assert.equal(cancellation.changes, 0);
  assert.equal(guestInfoUpdate.changes, 0);

  const booking = await new Promise((resolve, reject) => {
    database.get(
      'SELECT stato, intolleranze, note_ospite FROM bookings WHERE id = ?',
      [inserted.lastID],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });
  assert.deepEqual(booking, {
    stato: 'confermata',
    intolleranze: '',
    note_ospite: ''
  });
});
