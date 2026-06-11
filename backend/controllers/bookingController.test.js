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

test('booking creation rejects impossible dates before querying the room', (t) => {
  const originalGetById = RoomModel.getById;
  t.after(() => {
    RoomModel.getById = originalGetById;
  });

  RoomModel.getById = () => {
    assert.fail('RoomModel.getById must not run for invalid dates');
  };

  const req = {
    body: {
      camera_id: 4,
      data_inizio: '2026-02-30',
      data_fine: '2026-03-02'
    },
    user: { id: 7 }
  };
  const res = createResponse();

  BookingController.create(req, res);

  assert.equal(res.statusCode, 400);
});

test('guest information is updated only through the authenticated user scope', (t) => {
  const originalGetByIdForUser = BookingModel.getByIdForUser;
  const originalUpdateGuestInfo = BookingModel.updateGuestInfo;
  t.after(() => {
    BookingModel.getByIdForUser = originalGetByIdForUser;
    BookingModel.updateGuestInfo = originalUpdateGuestInfo;
  });

  let lookupArguments;
  let updateArguments;
  BookingModel.getByIdForUser = (bookingId, userId, callback) => {
    lookupArguments = [bookingId, userId];
    callback(null, {
      id: Number(bookingId),
      utente_id: userId,
      stato: 'confermata',
      data_fine: '2099-08-15'
    });
  };
  BookingModel.updateGuestInfo = (bookingId, userId, info, callback) => {
    updateArguments = [bookingId, userId, info];
    callback(null);
  };

  const req = {
    params: { id: '12' },
    body: {
      intolleranze: '  glutine  ',
      note_ospite: '  Arrivo alle 18  '
    },
    user: { id: 7 }
  };
  const res = createResponse();

  BookingController.updateGuestInfo(req, res);

  assert.deepEqual(lookupArguments, ['12', 7]);
  assert.deepEqual(updateArguments, [
    '12',
    7,
    {
      intolleranze: 'glutine',
      note_ospite: 'Arrivo alle 18'
    }
  ]);
  assert.equal(res.statusCode, 200);
});

test('users cannot cancel a concluded booking', (t) => {
  const originalGetByIdForUser = BookingModel.getByIdForUser;
  const originalCancelByUser = BookingModel.cancelByUser;
  t.after(() => {
    BookingModel.getByIdForUser = originalGetByIdForUser;
    BookingModel.cancelByUser = originalCancelByUser;
  });

  BookingModel.getByIdForUser = (_bookingId, _userId, callback) => {
    callback(null, {
      stato: 'confermata',
      data_fine: '2020-01-10'
    });
  };
  BookingModel.cancelByUser = () => {
    assert.fail('BookingModel.cancelByUser must not run for concluded bookings');
  };

  const req = {
    params: { id: '12' },
    user: { id: 7 }
  };
  const res = createResponse();

  BookingController.cancelMine(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    errore: 'Prenotazione non annullabile dopo il soggiorno'
  });
});

test('administrators cannot change bookings whose check-in has passed', (t) => {
  const originalGetById = BookingModel.getById;
  const originalUpdateStato = BookingModel.updateStato;
  t.after(() => {
    BookingModel.getById = originalGetById;
    BookingModel.updateStato = originalUpdateStato;
  });

  BookingModel.getById = (_bookingId, callback) => {
    callback(null, {
      stato: 'in attesa',
      data_inizio: '2020-01-10'
    });
  };
  BookingModel.updateStato = () => {
    assert.fail('BookingModel.updateStato must not run for past check-ins');
  };

  const req = {
    params: { id: '12' },
    body: { stato: 'confermata' }
  };
  const res = createResponse();

  BookingController.updateStato(req, res);

  assert.equal(res.statusCode, 400);
});
