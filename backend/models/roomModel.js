const db = require('../database');

function normalizeRoom(room) {
  return {
    nome: String(room.nome || '').trim(),
    descrizione: String(room.descrizione || '').trim(),
    tipo: String(room.tipo || '').trim(),
    prezzo: Number(room.prezzo),
    capienza: Number(room.capienza),
    disponibile: Number(room.disponibile ?? 1)
  };
}

function buildStoredImage(row) {
  return {
    id: row.id,
    filename: row.url,
    url: `/uploads/rooms/${row.room_id}/${row.url}`,
    ordine: row.ordine
  };
}

function formatRoomWithImages(room, imageRows) {
  const immagini = imageRows.map(buildStoredImage);
  const immagini_url = immagini.map((image) => image.url);

  return {
    ...room,
    immagine_url: immagini_url[0] || null,
    immagini_url,
    immagini
  };
}

function attachImagesToRooms(database, rooms, callback) {
  if (rooms.length === 0) {
    callback(null, rooms);
    return;
  }

  const roomIds = rooms.map((room) => room.id);
  const placeholders = roomIds.map(() => '?').join(', ');

  database.all(
    `SELECT id, room_id, url, ordine
     FROM room_images
     WHERE room_id IN (${placeholders})
     ORDER BY room_id, ordine, id`,
    roomIds,
    (err, rows) => {
      if (err) return callback(err);

      const imagesByRoomId = new Map(roomIds.map((roomId) => [roomId, []]));

      for (const row of rows) {
        const images = imagesByRoomId.get(row.room_id);

        if (images) {
          images.push(row);
        }
      }

      callback(null, rooms.map((room) =>
        formatRoomWithImages(room, imagesByRoomId.get(room.id) || [])
      ));
    }
  );
}

function attachImagesToRoom(database, room, callback) {
  if (!room) {
    callback(null, room);
    return;
  }

  attachImagesToRooms(database, [room], (err, rooms) => {
    if (err) return callback(err);
    callback(null, rooms[0]);
  });
}

function insertRoomImages(database, roomId, filenames, startOrder, callback) {
  let index = 0;

  function insertNext() {
    if (index >= filenames.length) {
      callback(null);
      return;
    }

    database.run(
      'INSERT INTO room_images (room_id, url, ordine) VALUES (?, ?, ?)',
      [roomId, filenames[index], startOrder + index],
      (err) => {
        if (err) return callback(err);
        index += 1;
        insertNext();
      }
    );
  }

  insertNext();
}

function updateKeptImageOrder(database, roomId, imageIds, callback) {
  let index = 0;

  function updateNext() {
    if (index >= imageIds.length) {
      callback(null);
      return;
    }

    database.run(
      'UPDATE room_images SET ordine = ? WHERE id = ? AND room_id = ?',
      [index, imageIds[index], roomId],
      function(err) {
        if (err) return callback(err);
        if (this.changes !== 1) {
          return callback(new Error('Una delle immagini mantenute non appartiene alla camera'));
        }

        index += 1;
        updateNext();
      }
    );
  }

  updateNext();
}

function rollback(database, err, callback) {
  database.run('ROLLBACK', () => callback(err));
}

function createRoomModel(database) {
  const mutationQueue = [];
  let mutationInProgress = false;

  function runNextMutation() {
    if (mutationInProgress || mutationQueue.length === 0) {
      return;
    }

    mutationInProgress = true;
    const mutation = mutationQueue.shift();

    mutation(() => {
      mutationInProgress = false;
      runNextMutation();
    });
  }

  function enqueueMutation(mutation) {
    mutationQueue.push(mutation);
    runNextMutation();
  }

  function completeMutation(done, callback, context, err) {
    try {
      callback.call(context, err);
    } finally {
      done();
    }
  }

  return {
    getAll: (callback) => {
      database.all('SELECT * FROM rooms ORDER BY id', [], (err, rows) => {
        if (err) return callback(err);
        attachImagesToRooms(database, rows, callback);
      });
    },

    getById: (id, callback) => {
      database.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
        if (err) return callback(err);
        attachImagesToRoom(database, row, callback);
      });
    },

    getDisponibili: (filters, callback) => {
      if (typeof filters === 'function') {
        callback = filters;
        filters = {};
      }

      const params = [];
      const where = ['disponibile = 1'];

      if (filters.ospiti) {
        where.push('capienza >= ?');
        params.push(filters.ospiti);
      }

      if (filters.data_inizio && filters.data_fine) {
        where.push(`
          NOT EXISTS (
            SELECT 1
            FROM bookings
            WHERE bookings.camera_id = rooms.id
              AND bookings.stato IN ('in attesa', 'confermata')
              AND bookings.data_inizio < ?
              AND bookings.data_fine > ?
          )
        `);
        params.push(filters.data_fine, filters.data_inizio);
      }

      database.all(
        `SELECT * FROM rooms WHERE ${where.join(' AND ')} ORDER BY id`,
        params,
        (err, rows) => {
          if (err) return callback(err);
          attachImagesToRooms(database, rows, callback);
        }
      );
    },

    create: (room, filenames, callback) => {
      const camera = normalizeRoom(room);

      enqueueMutation((done) => {
        const finish = (err, context = null) =>
          completeMutation(done, callback, context, err);

        database.run('BEGIN IMMEDIATE', (beginErr) => {
          if (beginErr) return finish(beginErr);

          database.run(
            `INSERT INTO rooms
             (nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url)
             VALUES (?, ?, ?, ?, ?, ?, NULL)`,
            [
              camera.nome,
              camera.descrizione,
              camera.tipo,
              camera.prezzo,
              camera.capienza,
              camera.disponibile
            ],
            function(insertErr) {
              if (insertErr) return rollback(database, insertErr, finish);

              const roomId = this.lastID;

              insertRoomImages(database, roomId, filenames, 0, (imagesErr) => {
                if (imagesErr) return rollback(database, imagesErr, finish);

                database.run('COMMIT', (commitErr) => {
                  if (commitErr) return rollback(database, commitErr, finish);
                  finish(null, { lastID: roomId });
                });
              });
            }
          );
        });
      });
    },

    update: (id, room, keptImageIds, newFilenames, callback) => {
      const camera = normalizeRoom(room);

      enqueueMutation((done) => {
        const finish = (err) => completeMutation(done, callback, null, err);

        database.run('BEGIN IMMEDIATE', (beginErr) => {
          if (beginErr) return finish(beginErr);

          database.run(
            `UPDATE rooms
             SET nome = ?, descrizione = ?, tipo = ?, prezzo = ?,
                 capienza = ?, disponibile = ?, immagine_url = NULL
             WHERE id = ?`,
            [
              camera.nome,
              camera.descrizione,
              camera.tipo,
              camera.prezzo,
              camera.capienza,
              camera.disponibile,
              id
            ],
            function(updateErr) {
              if (updateErr) return rollback(database, updateErr, finish);
              if (this.changes !== 1) {
                return rollback(database, new Error('Camera non trovata'), finish);
              }

              const deleteSql = keptImageIds.length > 0
                ? `DELETE FROM room_images
                   WHERE room_id = ? AND id NOT IN (${keptImageIds.map(() => '?').join(', ')})`
                : 'DELETE FROM room_images WHERE room_id = ?';
              const deleteParams = keptImageIds.length > 0
                ? [id, ...keptImageIds]
                : [id];

              database.run(deleteSql, deleteParams, (deleteErr) => {
                if (deleteErr) return rollback(database, deleteErr, finish);

                updateKeptImageOrder(database, id, keptImageIds, (orderErr) => {
                  if (orderErr) return rollback(database, orderErr, finish);

                  insertRoomImages(
                    database,
                    id,
                    newFilenames,
                    keptImageIds.length,
                    (imagesErr) => {
                      if (imagesErr) return rollback(database, imagesErr, finish);

                      database.run('COMMIT', (commitErr) => {
                        if (commitErr) return rollback(database, commitErr, finish);
                        finish(null);
                      });
                    }
                  );
                });
              });
            }
          );
        });
      });
    },

    deleteById: (id, callback) => {
      enqueueMutation((done) => {
        const finish = (err, context = null) =>
          completeMutation(done, callback, context, err);

        database.run('BEGIN IMMEDIATE', (beginErr) => {
          if (beginErr) return finish(beginErr);

          database.run('DELETE FROM reviews WHERE camera_id = ?', [id], function(reviewErr) {
            if (reviewErr) return rollback(database, reviewErr, finish);

            const deletedReviews = this.changes;

            database.run('DELETE FROM bookings WHERE camera_id = ?', [id], function(bookingErr) {
              if (bookingErr) return rollback(database, bookingErr, finish);

              const deletedBookings = this.changes;

              database.run('DELETE FROM rooms WHERE id = ?', [id], function(roomErr) {
                if (roomErr) return rollback(database, roomErr, finish);

                const deletedRooms = this.changes;

                database.run('COMMIT', (commitErr) => {
                  if (commitErr) return rollback(database, commitErr, finish);

                  finish(null, {
                    changes: deletedRooms,
                    deletedBookings,
                    deletedReviews
                  });
                });
              });
            });
          });
        });
      });
    }
  };
}

module.exports = createRoomModel(db);
module.exports.createRoomModel = createRoomModel;
