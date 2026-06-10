const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const AuthController = require('./authController');
const UserModel = require('../models/userModel');
const { loginValidation } = require('../middleware/authValidation');
const validateRequest = require('../middleware/validateRequest');

process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

function createLoginApp() {
  const app = express();
  app.use(express.json());
  app.post('/login', loginValidation, validateRequest, AuthController.login);
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
