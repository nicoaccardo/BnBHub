const assert = require('node:assert/strict');
const test = require('node:test');
const {
  PaymentValidationError,
  simulatePaymentAuthorization
} = require('./paymentGatewayService');

function createValidPayment(overrides = {}) {
  return {
    amount: 246.8,
    currency: 'eur',
    paymentMethodToken: 'tok_demo_bnbhub',
    booking: {
      camera_id: 4,
      data_inizio: '2026-08-10',
      data_fine: '2026-08-12'
    },
    ...overrides
  };
}

test('payment authorization normalizes the amount and references the user', () => {
  const payment = simulatePaymentAuthorization(createValidPayment(), { id: 7 });

  assert.equal(payment.success, true);
  assert.equal(payment.authorized, true);
  assert.equal(payment.captured, false);
  assert.equal(payment.amount, 246.8);
  assert.equal(payment.amountCents, 24680);
  assert.equal(payment.currency, 'EUR');
  assert.equal(payment.customerReference, 'USER-7');
  assert.equal(payment.booking.camera_id, 4);
  assert.match(payment.transactionId, /^SIM-\d{14}-[A-Z0-9]+$/);
});

test('payment validation rejects card data at any nesting level', () => {
  const paymentsWithSensitiveData = [
    createValidPayment({ cardNumber: '4242424242424242' }),
    createValidPayment({ metadata: { cvv: '123' } }),
    createValidPayment({ fields: [{ security_code: '123' }] })
  ];

  for (const payment of paymentsWithSensitiveData) {
    assert.throws(
      () => simulatePaymentAuthorization(payment, { id: 7 }),
      (err) => err instanceof PaymentValidationError
        && /Non inviare dati carta/.test(err.message)
    );
  }
});

test('payment validation rejects invalid amount, currency and demo token', () => {
  const invalidPayments = [
    createValidPayment({ amount: 0 }),
    createValidPayment({ currency: 'USD' }),
    createValidPayment({ paymentMethodToken: 'tok_wrong' })
  ];

  for (const payment of invalidPayments) {
    assert.throws(
      () => simulatePaymentAuthorization(payment, { id: 7 }),
      PaymentValidationError
    );
  }
});

test('payment validation rejects malformed or reversed booking dates', () => {
  const invalidBookings = [
    { camera_id: 4, data_inizio: '2026-02-30', data_fine: '2026-03-02' },
    { camera_id: 4, data_inizio: '2026-08-12', data_fine: '2026-08-10' },
    { camera_id: 0, data_inizio: '2026-08-10', data_fine: '2026-08-12' }
  ];

  for (const booking of invalidBookings) {
    assert.throws(
      () => simulatePaymentAuthorization(createValidPayment({ booking }), { id: 7 }),
      PaymentValidationError
    );
  }
});
