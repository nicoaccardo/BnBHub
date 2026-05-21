const db = require('../database');

const UserModel = {

  getAll: (callback) => {
    db.all(
      `SELECT id, nome, cognome, email, eta, telefono, codice_fiscale, ruolo, created_at
       FROM users`,
      [],
      callback
    );
  },

  getById: (id, callback) => {
    db.get(
      `SELECT id, nome, cognome, email, eta, telefono, codice_fiscale, ruolo, created_at
       FROM users WHERE id = ?`,
      [id],
      callback
    );
  },

  getByEmail: (email, callback) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  },

  getByCodiceFiscale: (codice_fiscale, callback) => {
    db.get('SELECT * FROM users WHERE codice_fiscale = ?', [codice_fiscale], callback);
  },

  create: (user, callback) => {
    const { nome, cognome, email, password, eta, telefono, codice_fiscale, ruolo } = user;
    db.run(
      `INSERT INTO users (nome, cognome, email, password, eta, telefono, codice_fiscale, ruolo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cognome, email, password, eta, telefono, codice_fiscale, ruolo || 'user'],
      callback
    );
  },

  update: (id, user, callback) => {
    const { nome, cognome, email, password, eta, telefono, codice_fiscale, ruolo } = user;

    if (password) {
      db.run(
        `UPDATE users
         SET nome = ?, cognome = ?, email = ?, password = ?, eta = ?, telefono = ?, codice_fiscale = ?, ruolo = ?
         WHERE id = ?`,
        [nome, cognome, email, password, eta, telefono, codice_fiscale, ruolo, id],
        callback
      );
      return;
    }

    db.run(
      `UPDATE users
       SET nome = ?, cognome = ?, email = ?, eta = ?, telefono = ?, codice_fiscale = ?, ruolo = ?
       WHERE id = ?`,
      [nome, cognome, email, eta, telefono, codice_fiscale, ruolo, id],
      callback
    );
  },

  deleteById: (id, callback) => {
    db.run('DELETE FROM users WHERE id = ?', [id], callback);
  }

};

module.exports = UserModel;
