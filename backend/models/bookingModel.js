const db = require('../database');

const BookingModel = {

  getAll: (callback) => {
    db.all(`
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
    db.all(`
      SELECT bookings.*,
             rooms.nome as camera_nome, rooms.tipo, rooms.prezzo, rooms.immagine_url,
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
    `, [utente_id], callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM bookings WHERE id = ?', [id], callback);
  },

  getByIdForUser: (id, utente_id, callback) => {
    db.get(
      'SELECT * FROM bookings WHERE id = ? AND utente_id = ?',
      [id, utente_id],
      callback
    );
  },

  getDetailedById: (id, callback) => {
    db.get(`
      SELECT bookings.*,
             users.nome, users.cognome, users.email,
             rooms.nome as camera_nome, rooms.tipo, rooms.prezzo
      FROM bookings
      JOIN users ON bookings.utente_id = users.id
      JOIN rooms ON bookings.camera_id = rooms.id
      WHERE bookings.id = ?
    `, [id], callback);
  },

  create: (booking, callback) => {
    const { utente_id, camera_id, data_inizio, data_fine, stato } = booking;
    db.run(
      `INSERT INTO bookings (utente_id, camera_id, data_inizio, data_fine, stato)
       VALUES (?, ?, ?, ?, ?)`,
      [utente_id, camera_id, data_inizio, data_fine, stato || 'in attesa'],
      callback
    );
  },

  hasOverlap: (camera_id, data_inizio, data_fine, callback) => {
    db.get(
      `SELECT id
       FROM bookings
       WHERE camera_id = ?
         AND stato IN ('in attesa', 'confermata')
         AND data_inizio < ?
         AND data_fine > ?
       LIMIT 1`,
      [camera_id, data_fine, data_inizio],
      callback
    );
  },

  updateStato: (id, stato, callback) => {
    db.run(
      'UPDATE bookings SET stato = ? WHERE id = ?',
      [stato, id],
      callback
    );
  },

  updateGuestInfo: (id, utente_id, info, callback) => {
    const { intolleranze, note_ospite } = info;
    db.run(
      `UPDATE bookings
       SET intolleranze = ?, note_ospite = ?
       WHERE id = ? AND utente_id = ?`,
      [intolleranze, note_ospite, id, utente_id],
      callback
    );
  },

  cancelByUser: (id, utente_id, callback) => {
    db.run(
      `UPDATE bookings
       SET stato = 'cancellata'
       WHERE id = ? AND utente_id = ? AND stato IN ('in attesa', 'confermata')`,
      [id, utente_id],
      callback
    );
  },

  deleteById: (id, callback) => {
    db.run('DELETE FROM bookings WHERE id = ?', [id], callback);
  }

};

module.exports = BookingModel;
