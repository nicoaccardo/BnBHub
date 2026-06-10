const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');
const request = require('supertest');
const {
  registrationValidation,
  loginValidation,
  passwordResetRequestValidation,
  passwordResetConfirmValidation
} = require('./authValidation');
const validateRequest = require('./validateRequest');

function createValidationApp(path, validation) {
  const app = express();
  app.use(express.json());
  app.post(path, validation, validateRequest, (req, res) => {
    res.json(req.body);
  });
  return app;
}

test('registration rejects incomplete payloads', async () => {
  const app = createValidationApp('/register', registrationValidation);
  const response = await request(app)
    .post('/register')
    .send({ email: 'utente@example.com' });

  assert.equal(response.status, 400);
  assert.equal(response.body.errore, 'Dati non validi');
});

test('registration rejects invalid emails and weak passwords', async () => {
  const app = createValidationApp('/register', registrationValidation);
  const basePayload = {
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario@example.com',
    password: 'Password1',
    eta: 30,
    telefono: '+39 333 1234567',
    codice_fiscale: 'RSSMRA80A01H501U'
  };

  const invalidEmailResponse = await request(app)
    .post('/register')
    .send({ ...basePayload, email: 'email-non-valida' });
  assert.equal(invalidEmailResponse.status, 400);

  const weakPasswordResponse = await request(app)
    .post('/register')
    .send({ ...basePayload, password: 'abcdef' });
  assert.equal(weakPasswordResponse.status, 400);
});

test('login normalizes email before reaching the controller', async () => {
  const app = createValidationApp('/login', loginValidation);
  const response = await request(app)
    .post('/login')
    .send({
      email: '  Utente@Example.COM ',
      password: 'Password1'
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.email, 'utente@example.com');
});

test('password reset request normalizes a valid email', async () => {
  const app = createValidationApp('/password-reset/request', passwordResetRequestValidation);
  const response = await request(app)
    .post('/password-reset/request')
    .send({ email: '  Utente@Example.COM ' });

  assert.equal(response.status, 200);
  assert.equal(response.body.email, 'utente@example.com');
});

test('password reset confirmation rejects malformed tokens and weak passwords', async () => {
  const app = createValidationApp('/password-reset/confirm', passwordResetConfirmValidation);

  const invalidTokenResponse = await request(app)
    .post('/password-reset/confirm')
    .send({ token: 'not-a-token', password: 'Password1' });
  assert.equal(invalidTokenResponse.status, 400);

  const weakPasswordResponse = await request(app)
    .post('/password-reset/confirm')
    .send({ token: 'a'.repeat(64), password: 'abcdef' });
  assert.equal(weakPasswordResponse.status, 400);
});
