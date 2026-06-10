const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');
const {
  MIN_JWT_SECRET_LENGTH,
  getCorsOrigins,
  validateSecurityConfig
} = require('./security');
const { createApp } = require('../app');

test('security config rejects missing and weak JWT secrets', () => {
  assert.throws(() => validateSecurityConfig({}), /JWT_SECRET/);
  assert.throws(
    () => validateSecurityConfig({ JWT_SECRET: 'too-short' }),
    /almeno 32 caratteri/
  );
  assert.doesNotThrow(() => validateSecurityConfig({
    JWT_SECRET: 'x'.repeat(MIN_JWT_SECRET_LENGTH)
  }));
});

test('CORS origins use local defaults and parse configured values', () => {
  assert.deepEqual(getCorsOrigins({}), [
    'http://localhost:4200',
    'http://localhost:8100'
  ]);
  assert.deepEqual(
    getCorsOrigins({ CORS_ORIGINS: 'https://one.test, https://two.test ' }),
    ['https://one.test', 'https://two.test']
  );
});

test('app applies Helmet and accepts configured or originless requests', async () => {
  const app = createApp({ corsOrigins: ['https://allowed.test'] });

  const allowedResponse = await request(app)
    .get('/')
    .set('Origin', 'https://allowed.test');
  assert.equal(allowedResponse.status, 200);
  assert.equal(
    allowedResponse.headers['access-control-allow-origin'],
    'https://allowed.test'
  );
  assert.equal(allowedResponse.headers['x-content-type-options'], 'nosniff');

  const originlessResponse = await request(app).get('/');
  assert.equal(originlessResponse.status, 200);
});

test('app rejects origins outside the CORS whitelist', async () => {
  const app = createApp({ corsOrigins: ['https://allowed.test'] });
  const response = await request(app)
    .get('/')
    .set('Origin', 'https://blocked.test');

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { errore: 'Origin CORS non consentito' });
});
