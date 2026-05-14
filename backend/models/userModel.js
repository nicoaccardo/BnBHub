const db = require('../database');

const UserModel = {

  getAll: (callback) => {
    db.all('SELECT * FROM users', [], callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  },

  getByEmail: (email, callback) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
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

  deleteById: (id, callback) => {
    db.run('DELETE FROM users WHERE id = ?', [id], callback);
  }

};

module.exports = UserModel;