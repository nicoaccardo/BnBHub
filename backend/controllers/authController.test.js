const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const AuthController = require('./authController');
const UserModel = require('../models/userModel');
const PasswordResetModel = require('../models/passwordResetModel');
const MailService = require('../services/mailService');
const {
  loginValidation,
  passwordResetRequestValidation,
  passwordResetConfirmValidation
} = require('../middleware/authValidation');
const validateRequest = require('../middleware/validateRequest');

process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

function createLoginApp() {
  const app = express();
  app.use(express.json());
  app.post('/login', loginValidation, validateRequest, AuthController.login);
  return app;
}

function createPasswordResetApp() {
  const app = express();
  app.use(express.json());
  app.post(
    '/password-reset/request',
    passwordResetRequestValidation,
    validateRequest,
    AuthController.requestPasswordReset
  );
  app.post(
    '/password-reset/confirm',
    passwordResetConfirmValidation,
    validateRequest,
    AuthController.confirmPasswordReset
  );
  return app;
}

test('login normalizes email and signs HS256 tokens', async (t) => {
  const originalGetByEmail = UserModel.getByEmail;
  let receivedEmail;
  t.after(() => {
    UserModel.getByEmail = originalGetByEmail;
  });

  UserModel.getByEmail = (email, callback) => {
    receivedEmail = email;
    callback(null, {
      id: 7,
      email,
      ruolo: 'user',
      password: bcrypt.hashSync('Password1', 4)
    });
  };

  const response = await request(createLoginApp())
    .post('/login')
    .send({
      email: '  Utente@Example.COM ',
      password: 'Password1'
    });

  assert.equal(response.status, 200);
  assert.equal(receivedEmail, 'utente@example.com');
  assert.equal(jwt.decode(response.body.token, { complete: true }).header.alg, 'HS256');
});

test('unknown users and wrong passwords return the same 401 response', async (t) => {
  const originalGetByEmail = UserModel.getByEmail;
  t.after(() => {
    UserModel.getByEmail = originalGetByEmail;
  });

  UserModel.getByEmail = (email, callback) => callback(null, null);
  const unknownUserResponse = await request(createLoginApp())
    .post('/login')
    .send({ email: 'unknown@example.com', password: 'Password1' });

  UserModel.getByEmail = (email, callback) => callback(null, {
    password: bcrypt.hashSync('Different1', 4)
  });
  const wrongPasswordResponse = await request(createLoginApp())
    .post('/login')
    .send({ email: 'utente@example.com', password: 'Password1' });

  assert.equal(unknownUserResponse.status, 401);
  assert.equal(wrongPasswordResponse.status, 401);
  assert.deepEqual(unknownUserResponse.body, wrongPasswordResponse.body);
});

test('password reset requests do not reveal whether an account exists', async (t) => {
  const originalGetByEmail = UserModel.getByEmail;
  const originalReplaceForUser = PasswordResetModel.replaceForUser;
  const originalSendPasswordResetEmail = MailService.sendPasswordResetEmail;
  let rawToken;
  let storedTokenHash;
  let expiresAt;

  t.after(() => {
    UserModel.getByEmail = originalGetByEmail;
    PasswordResetModel.replaceForUser = originalReplaceForUser;
    MailService.sendPasswordResetEmail = originalSendPasswordResetEmail;
  });

  PasswordResetModel.replaceForUser = (_userId, tokenHash, expiration, callback) => {
    storedTokenHash = tokenHash;
    expiresAt = expiration;
    callback(null, true);
  };
  MailService.sendPasswordResetEmail = (_user, token) => {
    rawToken = token;
    return Promise.resolve();
  };

  UserModel.getByEmail = (_email, callback) => callback(null, null);
  const unknownResponse = await request(createPasswordResetApp())
    .post('/password-reset/request')
    .send({ email: 'unknown@example.com' });

  UserModel.getByEmail = (email, callback) => callback(null, {
    id: 7,
    nome: 'Mario',
    email
  });
  const existingResponse = await request(createPasswordResetApp())
    .post('/password-reset/request')
    .send({ email: 'utente@example.com' });

  assert.equal(unknownResponse.status, 200);
  assert.equal(existingResponse.status, 200);
  assert.deepEqual(unknownResponse.body, existingResponse.body);
  assert.match(rawToken, /^[a-f0-9]{64}$/);
  assert.equal(
    storedTokenHash,
    require('node:crypto').createHash('sha256').update(rawToken).digest('hex')
  );
  assert.notEqual(storedTokenHash, rawToken);
  assert.ok(expiresAt > Date.now() + 29 * 60 * 1000);
});

test('password reset confirmation hashes the password and rejects reused tokens', async (t) => {
  const originalConsume = PasswordResetModel.consumeAndUpdatePassword;
  let receivedTokenHash;
  let receivedPasswordHash;
  let shouldUpdate = true;

  t.after(() => {
    PasswordResetModel.consumeAndUpdatePassword = originalConsume;
  });

  PasswordResetModel.consumeAndUpdatePassword = (
    tokenHash,
    passwordHash,
    _now,
    callback
  ) => {
    receivedTokenHash = tokenHash;
    receivedPasswordHash = passwordHash;
    callback(null, shouldUpdate);
  };

  const token = 'a'.repeat(64);
  const firstResponse = await request(createPasswordResetApp())
    .post('/password-reset/confirm')
    .send({ token, password: 'NuovaPassword1' });

  assert.equal(firstResponse.status, 200);
  assert.equal(
    receivedTokenHash,
    require('node:crypto').createHash('sha256').update(token).digest('hex')
  );
  assert.equal(bcrypt.compareSync('NuovaPassword1', receivedPasswordHash), true);

  shouldUpdate = false;
  const reusedResponse = await request(createPasswordResetApp())
    .post('/password-reset/confirm')
    .send({ token, password: 'NuovaPassword1' });

  assert.equal(reusedResponse.status, 400);
  assert.equal(reusedResponse.body.codice, 'TOKEN_RESET_NON_VALIDO');
});
