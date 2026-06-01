const db = require('../database');

const ReviewModel = {

  getAll: (callback) => {
    db.all(`
      SELECT reviews.*,
             users.nome, users.cognome, users.email,
             rooms.nome as camera_nome, rooms.tipo,
             bookings.data_inizio, bookings.data_fine
      FROM reviews
      JOIN users ON reviews.utente_id = users.id
      JOIN rooms ON reviews.camera_id = rooms.id
      JOIN bookings ON reviews.booking_id = bookings.id
      ORDER BY reviews.created_at DESC, reviews.id DESC
    `, [], callback);
  },

  getPublic: (callback) => {
    db.all(`
      SELECT reviews.id, reviews.voto, reviews.testo, reviews.created_at,
             users.nome, users.cognome,
             rooms.nome as camera_nome
      FROM reviews
      JOIN users ON reviews.utente_id = users.id
      JOIN rooms ON reviews.camera_id = rooms.id
      WHERE reviews.stato = 'pubblicata'
        AND reviews.visibile = 1
      ORDER BY reviews.created_at DESC, reviews.id DESC
      LIMIT 8
    `, [], callback);
  },

  getByBookingId: (bookingId, callback) => {
    db.get(
      'SELECT * FROM reviews WHERE booking_id = ?',
      [bookingId],
      callback
    );
  },

  getById: (id, callback) => {
    db.get(
      'SELECT * FROM reviews WHERE id = ?',
      [id],
      callback
    );
  },

  create: (review, callback) => {
    const { booking_id, utente_id, camera_id, voto, testo } = review;
    db.run(
      `INSERT INTO reviews (booking_id, utente_id, camera_id, voto, testo, visibile, stato)
       VALUES (?, ?, ?, ?, ?, 0, 'in attesa')`,
      [booking_id, utente_id, camera_id, voto, testo],
      callback
    );
  },

  updateStato: (id, stato, motivo_rifiuto, callback) => {
    const visibile = stato === 'pubblicata' ? 1 : 0;
    db.run(
      `UPDATE reviews
       SET stato = ?, visibile = ?, motivo_rifiuto = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [stato, visibile, motivo_rifiuto, id],
      callback
    );
  },

  updateVisibilita: (id, visibile, callback) => {
    const stato = visibile ? 'pubblicata' : 'in attesa';
    db.run(
      `UPDATE reviews
       SET visibile = ?, stato = ?, motivo_rifiuto = NULL, updated_at = datetime('now')
       WHERE id = ? AND stato != 'rifiutata'`,
      [visibile, stato, id],
      callback
    );
  }

};

module.exports = ReviewModel;
