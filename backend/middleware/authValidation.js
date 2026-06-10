const { body } = require('express-validator');

const NAME_PATTERN = /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF' -]+$/;
const PHONE_PATTERN = /^\+?[0-9 .()-]{8,20}$/;
const CODICE_FISCALE_PATTERN = /^[A-Za-z]{6}[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{3}[A-Za-z]$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function normalizeEmail(value) {
  return String(value).trim().toLowerCase();
}

const registrationValidation = [
  body('nome')
    .isString().withMessage('Il nome e obbligatorio')
    .bail()
    .trim()
    .isLength({ min: 2, max: 40 }).withMessage('Il nome deve contenere da 2 a 40 caratteri')
    .matches(NAME_PATTERN).withMessage('Il nome contiene caratteri non validi'),
  body('cognome')
    .isString().withMessage('Il cognome e obbligatorio')
    .bail()
    .trim()
    .isLength({ min: 2, max: 40 }).withMessage('Il cognome deve contenere da 2 a 40 caratteri')
    .matches(NAME_PATTERN).withMessage('Il cognome contiene caratteri non validi'),
  body('email')
    .isString().withMessage('L email e obbligatoria')
    .bail()
    .trim()
    .isLength({ max: 120 }).withMessage('L email non puo superare 120 caratteri')
    .isEmail().withMessage('Inserisci un indirizzo email valido')
    .customSanitizer(normalizeEmail),
  body('password')
    .isString().withMessage('La password e obbligatoria')
    .bail()
    .isLength({ min: 6, max: 64 }).withMessage('La password deve contenere da 6 a 64 caratteri')
    .matches(PASSWORD_PATTERN).withMessage('La password deve contenere almeno una lettera e un numero'),
  body('eta')
    .notEmpty().withMessage('L eta e obbligatoria')
    .bail()
    .isInt({ min: 18, max: 120 }).withMessage('L eta deve essere compresa tra 18 e 120')
    .toInt(),
  body('telefono')
    .isString().withMessage('Il telefono e obbligatorio')
    .bail()
    .trim()
    .matches(PHONE_PATTERN).withMessage('Inserisci un numero di telefono valido'),
  body('codice_fiscale')
    .isString().withMessage('Il codice fiscale e obbligatorio')
    .bail()
    .trim()
    .matches(CODICE_FISCALE_PATTERN).withMessage('Inserisci un codice fiscale valido')
    .customSanitizer((value) => value.toUpperCase())
];

const loginValidation = [
  body('email')
    .isString().withMessage('L email e obbligatoria')
    .bail()
    .trim()
    .isLength({ max: 120 }).withMessage('L email non puo superare 120 caratteri')
    .isEmail().withMessage('Inserisci un indirizzo email valido')
    .customSanitizer(normalizeEmail),
  body('password')
    .isString().withMessage('La password e obbligatoria')
    .bail()
    .isLength({ min: 6, max: 64 }).withMessage('La password deve contenere da 6 a 64 caratteri')
    .matches(PASSWORD_PATTERN).withMessage('La password deve contenere almeno una lettera e un numero')
];

const passwordResetRequestValidation = [
  body('email')
    .isString().withMessage('L email e obbligatoria')
    .bail()
    .trim()
    .isLength({ max: 120 }).withMessage('L email non puo superare 120 caratteri')
    .isEmail().withMessage('Inserisci un indirizzo email valido')
    .customSanitizer(normalizeEmail)
];

const passwordResetConfirmValidation = [
  body('token')
    .isString().withMessage('Il token di recupero è obbligatorio')
    .bail()
    .trim()
    .isLength({ min: 64, max: 64 }).withMessage('Il token di recupero non è valido')
    .isHexadecimal().withMessage('Il token di recupero non è valido'),
  body('password')
    .isString().withMessage('La password è obbligatoria')
    .bail()
    .isLength({ min: 6, max: 64 }).withMessage('La password deve contenere da 6 a 64 caratteri')
    .matches(PASSWORD_PATTERN).withMessage('La password deve contenere almeno una lettera e un numero')
];

module.exports = {
  registrationValidation,
  loginValidation,
  passwordResetRequestValidation,
  passwordResetConfirmValidation,
  normalizeEmail
};
