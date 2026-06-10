const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyUser } = require('./authMiddleware');

process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

function createResponse() {
  return {
    body: null,
    statusCode: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('verifyUser allows standard users', () => {
  const req = { user: { ruolo: 'user' } };
  const res = createResponse();
  let nextCalled = false;

  verifyUser(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('verifyUser rejects administrators', () => {
  const req = { user: { ruolo: 'admin' } };
  const res = createResponse();

  verifyUser(req, res, () => {
    assert.fail('next should not be called');
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { errore: 'Operazione riservata agli utenti' });
});

test('verifyUser rejects requests without an authenticated role', () => {
  const req = {};
  const res = createResponse();

  verifyUser(req, res, () => {
    assert.fail('next should not be called');
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { errore: 'Operazione riservata agli utenti' });
});

test('verifyToken accepts HS256 tokens', () => {
  const token = jwt.sign(
    { id: 7, ruolo: 'user' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' }
  );
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();
  let nextCalled = false;

  verifyToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 7);
});

test('verifyToken rejects tokens signed with other algorithms', () => {
  const token = jwt.sign(
    { id: 7, ruolo: 'user' },
    process.env.JWT_SECRET,
    { algorithm: 'HS384' }
  );
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createResponse();

  verifyToken(req, res, () => {
    assert.fail('next should not be called');
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { errore: 'Token non valido o scaduto' });
});
