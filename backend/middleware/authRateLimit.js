const rateLimit = require('express-rate-limit');

const RATE_LIMIT_MESSAGE = {
  errore: 'Troppi tentativi. Riprova piu tardi.'
};

function createLoginLimiter(options = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => res.status(429).json(RATE_LIMIT_MESSAGE),
    ...options
  });
}

function createRegistrationLimiter(options = {}) {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json(RATE_LIMIT_MESSAGE),
    ...options
  });
}

function createPasswordResetRequestLimiter(options = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({
      codice: 'TROPPE_RICHIESTE',
      errore: 'Troppe richieste. Attendi qualche minuto prima di riprovare.'
    }),
    ...options
  });
}

const loginLimiter = createLoginLimiter();
const registrationLimiter = createRegistrationLimiter();
const passwordResetRequestLimiter = createPasswordResetRequestLimiter();

module.exports = {
  loginLimiter,
  registrationLimiter,
  passwordResetRequestLimiter,
  createLoginLimiter,
  createRegistrationLimiter,
  createPasswordResetRequestLimiter
};
