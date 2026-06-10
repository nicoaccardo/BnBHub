const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_ALGORITHM, getJwtSecret } = require('../config/security');
const UserModel = require('../models/userModel');
const PasswordResetModel = require('../models/passwordResetModel');
const MailService = require('../services/mailService');

const PASSWORD_RESET_DURATION_MS = 30 * 60 * 1000;
const PASSWORD_RESET_REQUEST_MESSAGE =
  'Se l\'indirizzo email è associato a un account, riceverai un\'email con le istruzioni per reimpostare la password.';

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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

            MailService.sendRegistrationConfirmation({
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
  },

  requestPasswordReset: (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    const expiresAt = Date.now() + PASSWORD_RESET_DURATION_MS;

    UserModel.getByEmail(email, (userError, user) => {
      if (userError) {
        console.error('Errore ricerca utente per recupero password:', userError.message);
        return res.json({ messaggio: PASSWORD_RESET_REQUEST_MESSAGE });
      }

      if (!user) {
        return res.json({ messaggio: PASSWORD_RESET_REQUEST_MESSAGE });
      }

      PasswordResetModel.replaceForUser(user.id, tokenHash, expiresAt, (tokenError) => {
        if (tokenError) {
          console.error('Errore creazione token recupero password:', tokenError.message);
          return res.json({ messaggio: PASSWORD_RESET_REQUEST_MESSAGE });
        }

        MailService.sendPasswordResetEmail(user, token).catch((mailError) => {
          console.error('Errore invio email recupero password:', mailError.message);
        });

        return res.json({ messaggio: PASSWORD_RESET_REQUEST_MESSAGE });
      });
    });
  },

  confirmPasswordReset: (req, res) => {
    const { token, password } = req.body;
    const tokenHash = hashResetToken(token);
    const passwordHash = bcrypt.hashSync(password, 10);

    PasswordResetModel.consumeAndUpdatePassword(
      tokenHash,
      passwordHash,
      Date.now(),
      (resetError, updated) => {
        if (resetError) {
          console.error('Errore aggiornamento password:', resetError.message);
          return res.status(500).json({
            errore: 'Non e stato possibile reimpostare la password. Riprova.'
          });
        }

        if (!updated) {
          return res.status(400).json({
            codice: 'TOKEN_RESET_NON_VALIDO',
            errore: 'Il link di recupero non è valido o è scaduto.'
          });
        }

        return res.json({ messaggio: 'Password reimpostata con successo.' });
      }
    );
  }

};

module.exports = AuthController;
