const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');
const request = require('supertest');
const {
  createLoginLimiter,
  createRegistrationLimiter,
  createPasswordResetRequestLimiter
} = require('./authRateLimit');

function createLimitedApp(path, limiter, statusCode) {
  const app = express();
  app.post(path, limiter, (req, res) => {
    res.status(statusCode).json({ ok: statusCode < 400 });
  });
  return app;
}

test('login limiter returns 429 after the configured failed attempts', async () => {
  const limiter = createLoginLimiter({ max: 2 });
  const app = createLimitedApp('/login', limiter, 401);

  assert.equal((await request(app).post('/login')).status, 401);
  assert.equal((await request(app).post('/login')).status, 401);

  const limitedResponse = await request(app).post('/login');
  assert.equal(limitedResponse.status, 429);
  assert.equal(limitedResponse.body.errore, 'Troppi tentativi. Riprova piu tardi.');
});

test('registration limiter returns 429 after the configured attempts', async () => {
  const limiter = createRegistrationLimiter({ max: 2 });
  const app = createLimitedApp('/register', limiter, 201);

  assert.equal((await request(app).post('/register')).status, 201);
  assert.equal((await request(app).post('/register')).status, 201);

  const limitedResponse = await request(app).post('/register');
  assert.equal(limitedResponse.status, 429);
});

test('password reset limiter returns 429 after the configured attempts', async () => {
  const limiter = createPasswordResetRequestLimiter({ max: 2 });
  const app = createLimitedApp('/password-reset/request', limiter, 200);

  assert.equal((await request(app).post('/password-reset/request')).status, 200);
  assert.equal((await request(app).post('/password-reset/request')).status, 200);

  const limitedResponse = await request(app).post('/password-reset/request');
  assert.equal(limitedResponse.status, 429);
  assert.equal(limitedResponse.body.codice, 'TROPPE_RICHIESTE');
});
