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
    `, [], callback);
  },

  getByUtente: (utente_id, callback) => {
    db.all(`
      SELECT bookings.*,
             rooms.nome as camera_nome, rooms.tipo, rooms.prezzo, rooms.immagine_url
      FROM bookings
      JOIN rooms ON bookings.camera_id = rooms.id
      WHERE bookings.utente_id = ?
    `, [utente_id], callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM bookings WHERE id = ?', [id], callback);
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

  updateStato: (id, stato, callback) => {
    db.run(
      'UPDATE bookings SET stato = ? WHERE id = ?',
      [stato, id],
      callback
    );
  },

  deleteById: (id, callback) => {
    db.run('DELETE FROM bookings WHERE id = ?', [id], callback);
  }

};

module.exports = BookingModel;
