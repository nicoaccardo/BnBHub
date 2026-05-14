require('dotenv').config();
const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const AuthController = {

  register: (req, res) => {
    const { nome, cognome, email, password, eta, telefono, codice_fiscale } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    UserModel.create(
      { nome, cognome, email, password: hash, eta, telefono, codice_fiscale, ruolo: 'user' },
      function (err) {
        if (err) return res.status(500).json({ errore: err.message });
        res.status(201).json({ messaggio: 'Registrazione avvenuta con successo', id: this.lastID });
      }
    );
  },

  login: (req, res) => {
    const { email, password } = req.body;

    UserModel.getByEmail(email, (err, user) => {
      if (err) return res.status(500).json({ errore: err.message });
      if (!user) return res.status(404).json({ errore: 'Utente non trovato' });

      const passwordCorretta = bcrypt.compareSync(password, user.password);
      if (!passwordCorretta) return res.status(401).json({ errore: 'Password errata' });

      const token = jwt.sign(
        { id: user.id, email: user.email, ruolo: user.ruolo },
        SECRET,
        { expiresIn: '24h' }
      );

      res.json({ messaggio: 'Login effettuato con successo', token });
    });
  }

};

module.exports = AuthController;