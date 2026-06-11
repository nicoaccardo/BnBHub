const assert = require('node:assert/strict');
const test = require('node:test');
const ReviewController = require('./reviewController');
const BookingModel = require('../models/bookingModel');
const ReviewModel = require('../models/reviewModel');

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

function restoreModels(t) {
  const originals = {
    getByIdForUser: BookingModel.getByIdForUser,
    getByBookingId: ReviewModel.getByBookingId,
    create: ReviewModel.create,
    getById: ReviewModel.getById,
    updateStato: ReviewModel.updateStato
  };

  t.after(() => {
    BookingModel.getByIdForUser = originals.getByIdForUser;
    ReviewModel.getByBookingId = originals.getByBookingId;
    ReviewModel.create = originals.create;
    ReviewModel.getById = originals.getById;
    ReviewModel.updateStato = originals.updateStato;
  });
}

test('review creation rejects invalid votes before querying the booking', (t) => {
  restoreModels(t);
  BookingModel.getByIdForUser = () => {
    assert.fail('BookingModel.getByIdForUser must not run for invalid votes');
  };

  const req = {
    params: { bookingId: '12' },
    body: { voto: 6, testo: 'Ottimo soggiorno' },
    user: { id: 7 }
  };
  const res = createResponse();

  ReviewController.createForBooking(req, res);

  assert.equal(res.statusCode, 400);
});

test('review creation looks up the booking within the authenticated user scope', (t) => {
  restoreModels(t);
  let lookupArguments;
  BookingModel.getByIdForUser = (bookingId, userId, callback) => {
    lookupArguments = [bookingId, userId];
    callback(null, null);
  };

  const req = {
    params: { bookingId: '12' },
    body: { voto: 5, testo: 'Ottimo soggiorno' },
    user: { id: 7 }
  };
  const res = createResponse();

  ReviewController.createForBooking(req, res);

  assert.deepEqual(lookupArguments, [12, 7]);
  assert.equal(res.statusCode, 404);
});

test('reviews are accepted only after a confirmed stay has ended', (t) => {
  restoreModels(t);
  BookingModel.getByIdForUser = (_bookingId, _userId, callback) => {
    callback(null, {
      id: 12,
      camera_id: 4,
      stato: 'confermata',
      data_fine: '2099-08-15'
    });
  };
  ReviewModel.getByBookingId = () => {
    assert.fail('ReviewModel.getByBookingId must not run before the stay ends');
  };

  const req = {
    params: { bookingId: '12' },
    body: { voto: 5, testo: 'Ottimo soggiorno' },
    user: { id: 7 }
  };
  const res = createResponse();

  ReviewController.createForBooking(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    errore: 'Puoi recensire solo dopo la fine del soggiorno'
  });
});

test('a booking can receive only one review', (t) => {
  restoreModels(t);
  BookingModel.getByIdForUser = (_bookingId, _userId, callback) => {
    callback(null, {
      id: 12,
      camera_id: 4,
      stato: 'confermata',
      data_fine: '2020-01-10'
    });
  };
  ReviewModel.getByBookingId = (_bookingId, callback) => {
    callback(null, { id: 3 });
  };

  const req = {
    params: { bookingId: '12' },
    body: { voto: 5, testo: 'Ottimo soggiorno' },
    user: { id: 7 }
  };
  const res = createResponse();

  ReviewController.createForBooking(req, res);

  assert.equal(res.statusCode, 409);
});

test('a valid review is trimmed and stored as pending moderation', (t) => {
  restoreModels(t);
  let savedReview;
  BookingModel.getByIdForUser = (_bookingId, _userId, callback) => {
    callback(null, {
      id: 12,
      camera_id: 4,
      stato: 'confermata',
      data_fine: '2020-01-10'
    });
  };
  ReviewModel.getByBookingId = (_bookingId, callback) => callback(null, null);
  ReviewModel.create = (review, callback) => {
    savedReview = review;
    callback.call({ lastID: 9 }, null);
  };

  const req = {
    params: { bookingId: '12' },
    body: { voto: 5, testo: '  Ottimo soggiorno  ' },
    user: { id: 7 }
  };
  const res = createResponse();

  ReviewController.createForBooking(req, res);

  assert.deepEqual(savedReview, {
    booking_id: 12,
    utente_id: 7,
    camera_id: 4,
    voto: 5,
    testo: 'Ottimo soggiorno'
  });
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.id, 9);
});

test('a rejected review cannot be published later', (t) => {
  restoreModels(t);
  ReviewModel.getById = (_reviewId, callback) => {
    callback(null, { id: 9, stato: 'rifiutata' });
  };
  ReviewModel.updateStato = () => {
    assert.fail('ReviewModel.updateStato must not run for rejected reviews');
  };

  const req = {
    params: { id: '9' },
    body: { stato: 'pubblicata' }
  };
  const res = createResponse();

  ReviewController.updateStato(req, res);

  assert.equal(res.statusCode, 400);
});
