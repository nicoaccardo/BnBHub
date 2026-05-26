const db = require('../database');

const RoomModel = {

  getAll: (callback) => {
    db.all('SELECT * FROM rooms', [], callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM rooms WHERE id = ?', [id], callback);
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

    db.all(`SELECT * FROM rooms WHERE ${where.join(' AND ')}`, params, callback);
  },

  create: (room, callback) => {
    const { nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url } = room;
    db.run(
      `INSERT INTO rooms (nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, descrizione, tipo, prezzo, capienza, disponibile ?? 1, immagine_url],
      callback
    );
  },

  update: (id, room, callback) => {
    const { nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url } = room;
    db.run(
      `UPDATE rooms SET nome=?, descrizione=?, tipo=?, prezzo=?, capienza=?, disponibile=?, immagine_url=?
       WHERE id=?`,
      [nome, descrizione, tipo, prezzo, capienza, disponibile, immagine_url, id],
      callback
    );
  },

  deleteById: (id, callback) => {
    db.run('DELETE FROM rooms WHERE id = ?', [id], callback);
  }

};

module.exports = RoomModel;
