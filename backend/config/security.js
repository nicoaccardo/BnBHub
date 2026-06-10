const JWT_ALGORITHM = 'HS256';
const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_CORS_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:8100'
];

function getJwtSecret(env = process.env) {
  const secret = env.JWT_SECRET;

  if (typeof secret !== 'string' || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET deve essere configurato con almeno ${MIN_JWT_SECRET_LENGTH} caratteri`
    );
  }

  return secret;
}

function getCorsOrigins(env = process.env) {
  const configuredOrigins = env.CORS_ORIGINS;

  if (!configuredOrigins || configuredOrigins.trim() === '') {
    return DEFAULT_CORS_ORIGINS;
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function validateSecurityConfig(env = process.env) {
  getJwtSecret(env);
}

module.exports = {
  JWT_ALGORITHM,
  MIN_JWT_SECRET_LENGTH,
  DEFAULT_CORS_ORIGINS,
  getJwtSecret,
  getCorsOrigins,
  validateSecurityConfig
};
