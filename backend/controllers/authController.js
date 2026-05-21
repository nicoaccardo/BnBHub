require('dotenv').config();
const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const AuthController = {

  register: (req, res) => {
    const { nome, cognome, email, password, eta, telefono, codice_fiscale } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCodiceFiscale = codice_fiscale.trim().toUpperCase();
    const hash = bcrypt.hashSync(password, 10);

    UserModel.getByEmail(normalizedEmail, (emailErr, existingEmailUser) => {
      if (emailErr) return res.status(500).json({ errore: emailErr.message });

      if (existingEmailUser) {
        return res.status(409).json({
          codice: 'EMAIL_GIA_REGISTRATA',
          errore: 'Email gia registrata. Accedi con il tuo account esistente.'
        });
      }

      UserModel.getByCodiceFiscale(normalizedCodiceFiscale, (cfErr, existingCfUser) => {
        if (cfErr) return res.status(500).json({ errore: cfErr.message });

        if (existingCfUser) {
          return res.status(409).json({
            codice: 'CODICE_FISCALE_GIA_REGISTRATO',
            errore: 'Codice fiscale gia associato a un altro account.'
          });
        }

        UserModel.create(
          {
            nome: nome.trim(),
            cognome: cognome.trim(),
            email: normalizedEmail,
            password: hash,
            eta,
            telefono: telefono.trim(),
            codice_fiscale: normalizedCodiceFiscale,
            ruolo: 'user'
          },
          function (err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed: users.email')) {
                return res.status(409).json({
                  codice: 'EMAIL_GIA_REGISTRATA',
                  errore: 'Email gia registrata. Accedi con il tuo account esistente.'
                });
              }

              if (err.message.includes('UNIQUE constraint failed: users.codice_fiscale')) {
                return res.status(409).json({
                  codice: 'CODICE_FISCALE_GIA_REGISTRATO',
                  errore: 'Codice fiscale gia associato a un altro account.'
                });
              }

              return res.status(500).json({ errore: err.message });
            }

            res.status(201).json({ messaggio: 'Registrazione avvenuta con successo', id: this.lastID });
          }
        );
      });
    });
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
