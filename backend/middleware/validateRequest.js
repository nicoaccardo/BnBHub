const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
    return;
  }

  const dettagli = errors.array().map((error) => ({
    campo: error.path,
    messaggio: error.msg
  }));

  res.status(400).json({
    errore: 'Dati non validi',
    dettagli
  });
}

module.exports = validateRequest;
