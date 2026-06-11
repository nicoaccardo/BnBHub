const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
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

test('room uploads require authentication before multipart parsing', async () => {
  const app = createApp({ corsOrigins: ['https://allowed.test'] });
  const response = await request(app)
    .post('/rooms')
    .field('camera', '{}')
    .attach('immagini', Buffer.from('not-an-image'), {
      filename: 'camera.jpg',
      contentType: 'image/jpeg'
    });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { errore: 'Token mancante' });
});

test('uploaded images are served without directory listing and allow cross-origin display', async (t) => {
  const originalUploadsPath = process.env.UPLOADS_PATH;
  const uploadsPath = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'bnbhub-static-'));
  const roomDirectory = path.join(uploadsPath, 'rooms', '1');
  const filename = '11111111-1111-4111-8111-111111111111.webp';
  await fs.promises.mkdir(roomDirectory, { recursive: true });
  await fs.promises.writeFile(path.join(roomDirectory, filename), Buffer.from('webp'));
  process.env.UPLOADS_PATH = uploadsPath;

  t.after(async () => {
    if (originalUploadsPath === undefined) {
      delete process.env.UPLOADS_PATH;
    } else {
      process.env.UPLOADS_PATH = originalUploadsPath;
    }
    await fs.promises.rm(uploadsPath, { recursive: true, force: true });
  });

  const app = createApp({ corsOrigins: ['https://allowed.test'] });
  const imageResponse = await request(app).get(`/uploads/rooms/1/${filename}`);
  const directoryResponse = await request(app).get('/uploads/rooms/1/');

  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers['content-type'], 'image/webp');
  assert.equal(imageResponse.headers['cross-origin-resource-policy'], 'cross-origin');
  assert.equal(directoryResponse.status, 404);
});
