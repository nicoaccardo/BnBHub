const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const UserController = {

  getAll: (req, res) => {
    UserModel.getAll((err, rows) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json(rows);
    });
  },

  getById: (req, res) => {
    UserModel.getById(req.params.id, (err, row) => {
      if (err) return res.status(500).json({ errore: err.message });
      if (!row) return res.status(404).json({ errore: 'Utente non trovato' });
      res.json(row);
    });
  },

  create: (req, res) => {
    const { nome, cognome, email, password, eta, telefono, codice_fiscale, ruolo } = req.body;

    const hash = bcrypt.hashSync(password, 10);

    UserModel.create(
      { nome, cognome, email, password: hash, eta, telefono, codice_fiscale, ruolo },
      function (err) {
        if (err) return res.status(500).json({ errore: err.message });
        res.status(201).json({ messaggio: 'Utente creato con successo', id: this.lastID });
      }
    );
  },

  deleteById: (req, res) => {
    UserModel.deleteById(req.params.id, (err) => {
      if (err) return res.status(500).json({ errore: err.message });
      res.json({ messaggio: 'Utente eliminato con successo' });
    });
  }

};

module.exports = UserController;