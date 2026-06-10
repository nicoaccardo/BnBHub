const assert = require('node:assert/strict');
const test = require('node:test');
const BookingController = require('./bookingController');
const BookingModel = require('../models/bookingModel');
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

test('booking creation returns 409 when the atomic insert finds an overlap', (t) => {
  const originalGetById = RoomModel.getById;
  const originalCreateIfAvailable = BookingModel.createIfAvailable;
  t.after(() => {
    RoomModel.getById = originalGetById;
    BookingModel.createIfAvailable = originalCreateIfAvailable;
  });

  RoomModel.getById = (id, callback) => {
    callback(null, { id, disponibile: 1 });
  };
  BookingModel.createIfAvailable = (booking, callback) => {
    callback.call({ changes: 0 }, null);
  };

  const req = {
    body: {
      camera_id: 4,
      data_inizio: '2026-08-10',
      data_fine: '2026-08-15'
    },
    user: { id: 7 }
  };
  const res = createResponse();

  BookingController.create(req, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, {
    errore: 'La camera non è disponibile nel periodo selezionato'
  });
});
