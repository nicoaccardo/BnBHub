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

function createRoom(model, room, filenames) {
  return new Promise((resolve, reject) => {
    model.create(room, filenames, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this.lastID);
    });
  });
}

function getRoomById(model, id) {
  return new Promise((resolve, reject) => {
    model.getById(id, (err, room) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(room);
    });
  });
}

function updateRoom(model, id, room, keptImageIds, filenames) {
  return new Promise((resolve, reject) => {
    model.update(id, room, keptImageIds, filenames, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

function deleteRoom(model, id) {
  return new Promise((resolve, reject) => {
    model.deleteById(id, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        changes: this.changes,
        deletedBookings: this.deletedBookings,
        deletedReviews: this.deletedReviews
      });
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

test('room images preserve ids, order and a null legacy URL during updates', async (t) => {
  const database = new sqlite3.Database(':memory:');
  const model = createRoomModel(database);
  t.after(() => database.close());

  await run(database, 'PRAGMA foreign_keys = ON');
  await run(database, `
    CREATE TABLE rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      ordine INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

  const room = {
    nome: 'Camera immagini',
    descrizione: 'Descrizione',
    tipo: 'suite',
    prezzo: 180,
    capienza: 3,
    disponibile: 1
  };
  const firstFilename = '11111111-1111-4111-8111-111111111111.webp';
  const secondFilename = '22222222-2222-4222-8222-222222222222.webp';
  const newFilename = '33333333-3333-4333-8333-333333333333.webp';
  const roomId = await createRoom(model, room, [firstFilename, secondFilename]);
  const createdRoom = await getRoomById(model, roomId);
  const keptImageId = createdRoom.immagini[1].id;

  await updateRoom(
    model,
    roomId,
    { ...room, nome: 'Camera aggiornata' },
    [keptImageId],
    [newFilename]
  );

  const updatedRoom = await getRoomById(model, roomId);
  assert.equal(updatedRoom.nome, 'Camera aggiornata');
  assert.equal(updatedRoom.immagine_url, `/uploads/rooms/${roomId}/${secondFilename}`);
  assert.deepEqual(
    updatedRoom.immagini.map((image) => ({
      id: image.id,
      filename: image.filename,
      ordine: image.ordine
    })),
    [
      { id: keptImageId, filename: secondFilename, ordine: 0 },
      { id: keptImageId + 1, filename: newFilename, ordine: 1 }
    ]
  );

  const rawRoom = await new Promise((resolve, reject) => {
    database.get('SELECT immagine_url FROM rooms WHERE id = ?', [roomId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  assert.equal(rawRoom.immagine_url, null);
});

test('concurrent room mutations remain transactionally isolated', async (t) => {
  const database = new sqlite3.Database(':memory:');
  const model = createRoomModel(database);
  t.after(() => database.close());

  await run(database, `
    CREATE TABLE rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

  const baseRoom = {
    descrizione: '',
    tipo: 'doppia',
    prezzo: 100,
    capienza: 2,
    disponibile: 1
  };

  const roomIds = await Promise.all([
    createRoom(model, { ...baseRoom, nome: 'Camera uno' }, [
      '11111111-1111-4111-8111-111111111111.webp'
    ]),
    createRoom(model, { ...baseRoom, nome: 'Camera due' }, [
      '22222222-2222-4222-8222-222222222222.webp'
    ])
  ]);

  assert.equal(new Set(roomIds).size, 2);
  const rooms = await Promise.all(roomIds.map((roomId) => getRoomById(model, roomId)));
  assert.deepEqual(rooms.map((room) => room.immagini.length), [1, 1]);
});

test('deleting a room also deletes linked bookings and reviews atomically', async (t) => {
  const database = new sqlite3.Database(':memory:');
  const model = createRoomModel(database);
  t.after(() => database.close());

  await run(database, 'PRAGMA foreign_keys = ON');
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
      ordine INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);
  await run(database, `
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY,
      camera_id INTEGER NOT NULL,
      FOREIGN KEY (camera_id) REFERENCES rooms(id)
    )
  `);
  await run(database, `
    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY,
      booking_id INTEGER NOT NULL,
      camera_id INTEGER NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (camera_id) REFERENCES rooms(id)
    )
  `);
  await run(
    database,
    `INSERT INTO rooms
     (id, nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url)
     VALUES (3, 'Matrimoniale 3', '', 'doppia', 100, 2, 1, NULL)`
  );
  await run(
    database,
    `INSERT INTO room_images (room_id, url, ordine)
     VALUES (3, '11111111-1111-4111-8111-111111111111.webp', 0)`
  );
  await run(database, 'INSERT INTO bookings (id, camera_id) VALUES (10, 3)');
  await run(
    database,
    'INSERT INTO reviews (id, booking_id, camera_id) VALUES (20, 10, 3)'
  );

  const result = await deleteRoom(model, 3);

  assert.deepEqual(result, {
    changes: 1,
    deletedBookings: 1,
    deletedReviews: 1
  });

  for (const table of ['rooms', 'room_images', 'bookings', 'reviews']) {
    const row = await new Promise((resolve, reject) => {
      database.get(`SELECT COUNT(*) AS count FROM ${table}`, [], (err, value) => {
        if (err) reject(err);
        else resolve(value);
      });
    });
    assert.equal(row.count, 0);
  }
});
