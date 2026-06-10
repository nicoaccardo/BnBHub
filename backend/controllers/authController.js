const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_ALGORITHM, getJwtSecret } = require('../config/security');
const UserModel = require('../models/userModel');
const { sendRegistrationConfirmation } = require('../services/mailService');

const AuthController = {

  register: (req, res) => {
    const { nome, cognome, email, password, eta, telefono, codice_fiscale } = req.body;
    const normalizedEmail = email.toLowerCase();
    const normalizedCodiceFiscale = codice_fiscale.toUpperCase();
    const hash = bcrypt.hashSync(password, 10);

    UserModel.getByEmail(normalizedEmail, (emailErr, existingEmailUser) => {
      if (emailErr) return res.status(500).json({ errore: emailErr.message });

      if (existingEmailUser) {
        return res.status(409).json({
          codice: 'EMAIL_GIA_REGISTRATA',
          errore: 'Email già registrata. Accedi con il tuo account esistente.'
        });
      }

      UserModel.getByCodiceFiscale(normalizedCodiceFiscale, (cfErr, existingCfUser) => {
        if (cfErr) return res.status(500).json({ errore: cfErr.message });

        if (existingCfUser) {
          return res.status(409).json({
            codice: 'CODICE_FISCALE_GIA_REGISTRATO',
            errore: 'Codice fiscale già associato a un altro account.'
          });
        }

        UserModel.create(
          {
            nome,
            cognome,
            email: normalizedEmail,
            password: hash,
            eta,
            telefono,
            codice_fiscale: normalizedCodiceFiscale,
            ruolo: 'user'
          },
          function (err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed: users.email')) {
                return res.status(409).json({
                  codice: 'EMAIL_GIA_REGISTRATA',
                  errore: 'Email già registrata. Accedi con il tuo account esistente.'
                });
              }

              if (err.message.includes('UNIQUE constraint failed: users.codice_fiscale')) {
                return res.status(409).json({
                  codice: 'CODICE_FISCALE_GIA_REGISTRATO',
                  errore: 'Codice fiscale già associato a un altro account.'
                });
              }

              return res.status(500).json({ errore: err.message });
            }

            sendRegistrationConfirmation({
              nome,
              cognome,
              email: normalizedEmail
            }).catch((mailErr) => {
              console.error('Errore invio email registrazione:', mailErr.message);
            });

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
      if (!user) return res.status(401).json({ errore: 'Credenziali non valide' });

      const passwordCorretta = bcrypt.compareSync(password, user.password);
      if (!passwordCorretta) {
        return res.status(401).json({ errore: 'Credenziali non valide' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, ruolo: user.ruolo },
        getJwtSecret(),
        {
          algorithm: JWT_ALGORITHM,
          expiresIn: '24h'
        }
      );

      res.json({ messaggio: 'Login effettuato con successo', token });
    });
  }

};

module.exports = AuthController;
