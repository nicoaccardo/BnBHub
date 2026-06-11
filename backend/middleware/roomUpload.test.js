const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const test = require('node:test');
const { uploadRoomImages } = require('./roomUpload');

function createUploadTestApp() {
  const app = express();
  app.post('/upload', uploadRoomImages, (req, res) => {
    res.json({ files: req.files.length });
  });
  return app;
}

test('room upload rejects unsupported MIME types', async () => {
  const response = await request(createUploadTestApp())
    .post('/upload')
    .field('camera', '{}')
    .attach('immagini', Buffer.from('text'), {
      filename: 'camera.txt',
      contentType: 'text/plain'
    });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    errore: 'Sono consentite solo immagini JPEG, PNG o WebP'
  });
});

test('room upload rejects files larger than 5 MB', async () => {
  const response = await request(createUploadTestApp())
    .post('/upload')
    .field('camera', '{}')
    .attach('immagini', Buffer.alloc(5 * 1024 * 1024 + 1), {
      filename: 'camera.jpg',
      contentType: 'image/jpeg'
    });

  assert.equal(response.status, 413);
  assert.deepEqual(response.body, {
    errore: 'Ogni immagine deve avere una dimensione massima di 5 MB'
  });
});

test('room upload rejects more than 10 files', async () => {
  let uploadRequest = request(createUploadTestApp())
    .post('/upload')
    .field('camera', '{}');

  for (let index = 0; index < 11; index += 1) {
    uploadRequest = uploadRequest.attach('immagini', Buffer.from('image'), {
      filename: `camera-${index}.jpg`,
      contentType: 'image/jpeg'
    });
  }

  const response = await uploadRequest;

  assert.equal(response.status, 413);
  assert.deepEqual(response.body, {
    errore: 'Puoi caricare al massimo 10 immagini per camera'
  });
});
