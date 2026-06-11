const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const sharp = require('sharp');
const RoomController = require('./roomController');
const RoomModel = require('../models/roomModel');

function createResponse() {
  return {
    body: null,
    statusCode: 200,
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

function createValidRoom(overrides = {}) {
  return {
    nome: 'Camera test',
    descrizione: 'Descrizione',
    tipo: 'doppia',
    prezzo: 100,
    capienza: 2,
    disponibile: 1,
    ...overrides
  };
}

async function createPngBuffer() {
  return sharp({
    create: {
      width: 2400,
      height: 1600,
      channels: 3,
      background: '#C18C72'
    }
  }).png().toBuffer();
}

test('room creation converts a valid image to a bounded WebP file', async (t) => {
  const originalCreate = RoomModel.create;
  const originalDelete = RoomModel.deleteById;
  const originalUploadsPath = process.env.UPLOADS_PATH;
  const uploadsPath = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'bnbhub-room-'));
  process.env.UPLOADS_PATH = uploadsPath;

  t.after(async () => {
    RoomModel.create = originalCreate;
    RoomModel.deleteById = originalDelete;
    if (originalUploadsPath === undefined) {
      delete process.env.UPLOADS_PATH;
    } else {
      process.env.UPLOADS_PATH = originalUploadsPath;
    }
    await fs.promises.rm(uploadsPath, { recursive: true, force: true });
  });

  let savedFilenames;
  RoomModel.create = (_room, filenames, callback) => {
    savedFilenames = filenames;
    callback.call({ lastID: 12 }, null);
  };
  RoomModel.deleteById = (_id, callback) => callback.call({ changes: 1 }, null);

  const req = {
    body: { camera: JSON.stringify(createValidRoom()) },
    files: [{
      originalname: 'camera.png',
      mimetype: 'image/png',
      buffer: await createPngBuffer()
    }]
  };
  const res = createResponse();

  await RoomController.create(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(savedFilenames.length, 1);
  assert.match(savedFilenames[0], /^[0-9a-f-]+\.webp$/);

  const savedPath = path.join(uploadsPath, 'rooms', '12', savedFilenames[0]);
  const savedBuffer = await fs.promises.readFile(savedPath);
  const metadata = await sharp(savedBuffer).metadata();
  assert.equal(metadata.format, 'webp');
  assert.ok(metadata.width <= 1920);
  assert.ok(metadata.height <= 1920);
});

test('room creation rejects corrupted image content before touching the model', async (t) => {
  const originalCreate = RoomModel.create;
  t.after(() => {
    RoomModel.create = originalCreate;
  });

  RoomModel.create = () => {
    assert.fail('RoomModel.create must not run for corrupted images');
  };

  const req = {
    body: { camera: JSON.stringify(createValidRoom()) },
    files: [{
      originalname: 'finta.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('not-an-image')
    }]
  };
  const res = createResponse();

  await RoomController.create(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.errore, /non contiene un'immagine valida/);
});

test('room creation rejects a MIME type that does not match the decoded image', async (t) => {
  const originalCreate = RoomModel.create;
  t.after(() => {
    RoomModel.create = originalCreate;
  });

  RoomModel.create = () => {
    assert.fail('RoomModel.create must not run for mismatched image formats');
  };

  const req = {
    body: { camera: JSON.stringify(createValidRoom()) },
    files: [{
      originalname: 'finta.jpg',
      mimetype: 'image/jpeg',
      buffer: await createPngBuffer()
    }]
  };
  const res = createResponse();

  await RoomController.create(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.errore, /non contiene un'immagine valida/);
});

test('room creation requires at least one image', async (t) => {
  const originalCreate = RoomModel.create;
  t.after(() => {
    RoomModel.create = originalCreate;
  });

  RoomModel.create = () => {
    assert.fail('RoomModel.create must not run without images');
  };

  const req = {
    body: { camera: JSON.stringify(createValidRoom()) },
    files: []
  };
  const res = createResponse();

  await RoomController.create(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { errore: 'Seleziona almeno una foto della camera' });
});

test('room update rejects image ids owned by another room', async (t) => {
  const originalGetById = RoomModel.getById;
  const originalUpdate = RoomModel.update;
  t.after(() => {
    RoomModel.getById = originalGetById;
    RoomModel.update = originalUpdate;
  });

  RoomModel.getById = (_id, callback) => {
    callback(null, {
      id: 7,
      immagini: [{
        id: 21,
        filename: '11111111-1111-4111-8111-111111111111.webp',
        url: '/uploads/rooms/7/11111111-1111-4111-8111-111111111111.webp',
        ordine: 0
      }]
    });
  };
  RoomModel.update = () => {
    assert.fail('RoomModel.update must not run with foreign image ids');
  };

  const req = {
    params: { id: '7' },
    body: {
      camera: JSON.stringify(createValidRoom({ immagini_mantenute: [999] }))
    },
    files: []
  };
  const res = createResponse();

  await RoomController.update(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    errore: 'Una delle immagini mantenute non appartiene alla camera'
  });
});
