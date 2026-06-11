const db = require('../database');

function attachRoomImagesToBookings(database, bookings, callback) {
  if (bookings.length === 0) {
    callback(null, bookings);
    return;
  }

  const roomIds = [...new Set(bookings.map((booking) => booking.camera_id))];
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
          images.push({
            id: row.id,
            url: `/uploads/rooms/${row.room_id}/${row.url}`,
            ordine: row.ordine
          });
        }
      }

      const bookingsWithImages = bookings.map((booking) => {
        const immagini = imagesByRoomId.get(booking.camera_id) || [];
        const immagini_url = immagini.map((image) => image.url);

        return {
          ...booking,
          immagine_url: immagini_url[0] || null,
          immagini_url,
          immagini
        };
      });

      callback(null, bookingsWithImages);
    }
  );
}

function createBookingModel(database) {
  return {
    getAll: (callback) => {
      database.all(`
        SELECT bookings.*,
               users.nome, users.cognome, users.email,
               rooms.nome as camera_nome, rooms.tipo, rooms.prezzo
        FROM bookings
        JOIN users ON bookings.utente_id = users.id
        JOIN rooms ON bookings.camera_id = rooms.id
        ORDER BY bookings.data_inizio DESC, bookings.id DESC
      `, [], callback);
    },

    getByUtente: (utente_id, callback) => {
      database.all(`
        SELECT bookings.*,
               rooms.nome as camera_nome, rooms.tipo, rooms.prezzo,
               NULL as immagine_url,
               reviews.id as recensione_id,
               reviews.voto as recensione_voto,
               reviews.testo as recensione_testo,
               reviews.visibile as recensione_visibile,
               reviews.stato as recensione_stato
        FROM bookings
        JOIN rooms ON bookings.camera_id = rooms.id
        LEFT JOIN reviews ON reviews.booking_id = bookings.id
        WHERE bookings.utente_id = ?
        ORDER BY bookings.data_inizio DESC, bookings.id DESC
      `, [utente_id], (err, rows) => {
        if (err) return callback(err);
        attachRoomImagesToBookings(database, rows, callback);
      });
    },

    getById: (id, callback) => {
      database.get('SELECT * FROM bookings WHERE id = ?', [id], callback);
    },

    getByIdForUser: (id, utente_id, callback) => {
      database.get(
        'SELECT * FROM bookings WHERE id = ? AND utente_id = ?',
        [id, utente_id],
        callback
      );
    },

    getDetailedById: (id, callback) => {
      database.get(`
        SELECT bookings.*,
               users.nome, users.cognome, users.email,
               rooms.nome as camera_nome, rooms.tipo, rooms.prezzo
        FROM bookings
        JOIN users ON bookings.utente_id = users.id
        JOIN rooms ON bookings.camera_id = rooms.id
        WHERE bookings.id = ?
      `, [id], callback);
    },

    createIfAvailable: (booking, callback) => {
      const { utente_id, camera_id, data_inizio, data_fine, stato } = booking;
      const bookingStatus = stato || 'in attesa';

      database.run(
        `INSERT INTO bookings (utente_id, camera_id, data_inizio, data_fine, stato)
         SELECT ?, ?, ?, ?, ?
         WHERE NOT EXISTS (
           SELECT 1
           FROM bookings
           WHERE camera_id = ?
             AND stato IN ('in attesa', 'confermata')
             AND data_inizio < ?
             AND data_fine > ?
         )`,
        [
          utente_id,
          camera_id,
          data_inizio,
          data_fine,
          bookingStatus,
          camera_id,
          data_fine,
          data_inizio
        ],
        callback
      );
    },

    updateStato: (id, stato, callback) => {
      database.run(
        'UPDATE bookings SET stato = ? WHERE id = ?',
        [stato, id],
        callback
      );
    },

    updateGuestInfo: (id, utente_id, info, callback) => {
      const { intolleranze, note_ospite } = info;
      database.run(
        `UPDATE bookings
         SET intolleranze = ?, note_ospite = ?
         WHERE id = ? AND utente_id = ?`,
        [intolleranze, note_ospite, id, utente_id],
        callback
      );
    },

    cancelByUser: (id, utente_id, callback) => {
      database.run(
        `UPDATE bookings
         SET stato = 'cancellata'
         WHERE id = ? AND utente_id = ? AND stato IN ('in attesa', 'confermata')`,
        [id, utente_id],
        callback
      );
    },

    deleteById: (id, callback) => {
      database.run('DELETE FROM bookings WHERE id = ?', [id], callback);
    }

  };
}

module.exports = createBookingModel(db);
module.exports.createBookingModel = createBookingModel;
