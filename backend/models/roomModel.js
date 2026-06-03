const db = require('../database');

function normalizeImages(room) {
  const images = Array.isArray(room.immagini_url) ? room.immagini_url : [room.immagine_url];

  return images
    .map((url) => String(url || '').trim())
    .filter((url) => url !== '');
}

function normalizeRoom(room) {
  const immagini_url = normalizeImages(room);

  return {
    nome: String(room.nome || '').trim(),
    descrizione: String(room.descrizione || '').trim(),
    tipo: String(room.tipo || '').trim(),
    prezzo: Number(room.prezzo),
    capienza: Number(room.capienza),
    disponibile: Number(room.disponibile ?? 1),
    immagine_url: immagini_url[0] || null,
    immagini_url
  };
}

function formatRoomWithImages(room, images) {
  const immagini_url = images.length > 0 ? images : normalizeImages(room);

  return {
    ...room,
    immagine_url: immagini_url[0] || null,
    immagini_url
  };
}

function attachImagesToRooms(rooms, callback) {
  if (rooms.length === 0) {
    callback(null, rooms);
    return;
  }

  const roomIds = rooms.map((room) => room.id);
  const placeholders = roomIds.map(() => '?').join(', ');

  db.all(
    `SELECT room_id, url
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
          images.push(row.url);
        }
      }

      callback(null, rooms.map((room) => formatRoomWithImages(room, imagesByRoomId.get(room.id) || [])));
    }
  );
}

function attachImagesToRoom(room, callback) {
  if (!room) {
    callback(null, room);
    return;
  }

  attachImagesToRooms([room], (err, rooms) => {
    if (err) return callback(err);
    callback(null, rooms[0]);
  });
}

function insertRoomImages(roomId, images, callback) {
  if (images.length === 0) {
    callback(null);
    return;
  }

  let index = 0;

  function insertNext() {
    db.run(
      'INSERT INTO room_images (room_id, url, ordine) VALUES (?, ?, ?)',
      [roomId, images[index], index],
      (err) => {
        if (err) return callback(err);

        index += 1;

        if (index >= images.length) {
          callback(null);
          return;
        }

        insertNext();
      }
    );
  }

  insertNext();
}

function replaceRoomImages(roomId, images, callback) {
  db.run('DELETE FROM room_images WHERE room_id = ?', [roomId], (err) => {
    if (err) return callback(err);
    insertRoomImages(roomId, images, callback);
  });
}

const RoomModel = {

  getAll: (callback) => {
    db.all('SELECT * FROM rooms', [], (err, rows) => {
      if (err) return callback(err);
      attachImagesToRooms(rows, callback);
    });
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, row) => {
      if (err) return callback(err);
      attachImagesToRoom(row, callback);
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

    db.all(`SELECT * FROM rooms WHERE ${where.join(' AND ')}`, params, (err, rows) => {
      if (err) return callback(err);
      attachImagesToRooms(rows, callback);
    });
  },

  create: (room, callback) => {
    const camera = normalizeRoom(room);

    db.run(
      `INSERT INTO rooms (nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        camera.nome,
        camera.descrizione,
        camera.tipo,
        camera.prezzo,
        camera.capienza,
        camera.disponibile,
        camera.immagine_url
      ],
      function(err) {
        if (err) return callback.call(this, err);

        const roomId = this.lastID;

        replaceRoomImages(roomId, camera.immagini_url, (imageErr) => {
          callback.call({ lastID: roomId }, imageErr);
        });
      }
    );
  },

  update: (id, room, callback) => {
    const camera = normalizeRoom(room);

    db.run(
      `UPDATE rooms SET nome=?, descrizione=?, tipo=?, prezzo=?, capienza=?, disponibile=?, immagine_url=?
       WHERE id=?`,
      [
        camera.nome,
        camera.descrizione,
        camera.tipo,
        camera.prezzo,
        camera.capienza,
        camera.disponibile,
        camera.immagine_url,
        id
      ],
      function(err) {
        if (err) return callback(err);

        replaceRoomImages(id, camera.immagini_url, (imageErr) => {
          callback.call(this, imageErr);
        });
      }
    );
  },

  deleteById: (id, callback) => {
    db.run('DELETE FROM rooms WHERE id = ?', [id], callback);
  }

};

module.exports = RoomModel;
