const assert = require('node:assert/strict');
const test = require('node:test');
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

function createValidRoom(images) {
  return {
    nome: 'Camera test',
    descrizione: 'Descrizione',
    tipo: 'doppia',
    prezzo: 100,
    capienza: 2,
    disponibile: 1,
    immagini_url: images
  };
}

test('room creation accepts direct Unsplash CDN image URLs', (t) => {
  const originalCreate = RoomModel.create;
  t.after(() => {
    RoomModel.create = originalCreate;
  });

  let savedRoom = null;
  RoomModel.create = (room, callback) => {
    savedRoom = room;
    callback.call({ lastID: 12 }, null);
  };

  const req = {
    body: createValidRoom([
      'https://images.unsplash.com/photo-123?auto=format&fit=crop&w=900'
    ])
  };
  const res = createResponse();

  RoomController.create(req, res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(savedRoom.immagini_url, req.body.immagini_url);
});

test('room creation rejects an Unsplash page URL', (t) => {
  const originalCreate = RoomModel.create;
  t.after(() => {
    RoomModel.create = originalCreate;
  });

  let createCalled = false;
  RoomModel.create = () => {
    createCalled = true;
  };

  const req = {
    body: createValidRoom([
      'https://unsplash.com/it/foto/letto-bianco-p3UWyaujtQo'
    ])
  };
  const res = createResponse();

  RoomController.create(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(createCalled, false);
  assert.deepEqual(res.body, {
    errore: 'Il link Unsplash deve essere diretto. Usa "Copia indirizzo immagine"'
  });
});

test('room creation rejects malformed URLs and unsupported protocols', (t) => {
  const originalCreate = RoomModel.create;
  t.after(() => {
    RoomModel.create = originalCreate;
  });

  RoomModel.create = () => {
    assert.fail('RoomModel.create must not run for invalid image URLs');
  };

  for (const imageUrl of ['not-an-url', 'ftp://example.com/room.jpg']) {
    const req = { body: createValidRoom([imageUrl]) };
    const res = createResponse();

    RoomController.create(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
      errore: 'Ogni immagine deve avere un URL http/https valido'
    });
  }
});
