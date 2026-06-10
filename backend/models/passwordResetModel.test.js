const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const sqlite3 = require('sqlite3').verbose();
const { createPasswordResetModel } = require('./passwordResetModel');

function run(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function get(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function close(database) {
  return new Promise((resolve, reject) => {
    database.close((error) => error ? reject(error) : resolve());
  });
}

function replaceForUser(model, userId, tokenHash, expiresAt) {
  return new Promise((resolve, reject) => {
    model.replaceForUser(userId, tokenHash, expiresAt, (error, created) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(created);
    });
  });
}

function consumeAndUpdatePassword(model, tokenHash, passwordHash, now) {
  return new Promise((resolve, reject) => {
    model.consumeAndUpdatePassword(tokenHash, passwordHash, now, (error, updated) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(updated);
    });
  });
}

async function createDatabase(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'bnbhub-password-reset-'));
  const databasePath = path.join(directory, 'test.sqlite');
  const database = new sqlite3.Database(databasePath);

  t.after(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  await run(database, 'PRAGMA foreign_keys = ON');
  await run(database, `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL
    )
  `);
  await run(database, `
    CREATE TABLE password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  const user = await run(database, 'INSERT INTO users (password) VALUES (?)', ['old-hash']);
  await close(database);

  return {
    databasePath,
    userId: user.lastID,
    model: createPasswordResetModel(databasePath)
  };
}

test('a new reset token invalidates the previous active token', async (t) => {
  const { databasePath, userId, model } = await createDatabase(t);

  await replaceForUser(model, userId, 'first-hash', Date.now() + 60_000);
  await replaceForUser(model, userId, 'second-hash', Date.now() + 60_000);

  const database = new sqlite3.Database(databasePath);
  const first = await get(
    database,
    'SELECT used_at FROM password_reset_tokens WHERE token_hash = ?',
    ['first-hash']
  );
  const second = await get(
    database,
    'SELECT used_at FROM password_reset_tokens WHERE token_hash = ?',
    ['second-hash']
  );
  await close(database);

  assert.ok(first.used_at);
  assert.equal(second.used_at, null);
});

test('a reset token is single-use and updates the password atomically', async (t) => {
  const { databasePath, userId, model } = await createDatabase(t);
  const tokenHash = 'single-use-hash';

  await replaceForUser(model, userId, tokenHash, Date.now() + 60_000);

  assert.equal(
    await consumeAndUpdatePassword(model, tokenHash, 'new-hash', Date.now()),
    true
  );
  assert.equal(
    await consumeAndUpdatePassword(model, tokenHash, 'another-hash', Date.now()),
    false
  );

  const database = new sqlite3.Database(databasePath);
  const user = await get(database, 'SELECT password FROM users WHERE id = ?', [userId]);
  await close(database);

  assert.equal(user.password, 'new-hash');
});

test('an expired reset token cannot update the password', async (t) => {
  const { databasePath, userId, model } = await createDatabase(t);
  const tokenHash = 'expired-hash';

  await replaceForUser(model, userId, tokenHash, Date.now() - 1);

  assert.equal(
    await consumeAndUpdatePassword(model, tokenHash, 'new-hash', Date.now()),
    false
  );

  const database = new sqlite3.Database(databasePath);
  const user = await get(database, 'SELECT password FROM users WHERE id = ?', [userId]);
  await close(database);

  assert.equal(user.password, 'old-hash');
});
