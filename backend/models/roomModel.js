const db = require('../database');

const RoomModel = {

  getAll: (callback) => {
    db.all('SELECT * FROM rooms', [], callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM rooms WHERE id = ?', [id], callback);
  },

  getDisponibili: (callback) => {
    db.all('SELECT * FROM rooms WHERE disponibile = 1', [], callback);
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