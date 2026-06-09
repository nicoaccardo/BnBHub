class PaymentValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PaymentValidationError';
  }
}

const SENSITIVE_CARD_FIELDS = new Set([
  'card',
  'cardnumber',
  'card_number',
  'numerocarta',
  'numero_carta',
  'pan',
  'cvv',
  'cvc',
  'securitycode',
  'security_code',
  'codicesicurezza',
  'codice_sicurezza',
  'expiry',
  'expiration',
  'scadenza'
]);

function createProviderId(prefix) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${timestamp}-${suffix}`;
}

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[\s-]/g, '');
}

function containsCardData(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(containsCardData);
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    const normalizedKey = normalizeKey(key);
    return SENSITIVE_CARD_FIELDS.has(normalizedKey) || containsCardData(nestedValue);
  });
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validatePaymentRequest(payment) {
  if (containsCardData(payment)) {
    throw new PaymentValidationError('Non inviare dati carta al server: usa un token generato dal provider di pagamento.');
  }

  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PaymentValidationError('Importo pagamento non valido.');
  }

  const currency = String(payment.currency || 'EUR').trim().toUpperCase();
  if (currency !== 'EUR') {
    throw new PaymentValidationError('Valuta non supportata per la simulazione.');
  }

  if (payment.paymentMethodToken !== 'tok_demo_bnbhub') {
    throw new PaymentValidationError('Metodo di pagamento demo non valido.');
  }

  const booking = payment.booking || {};
  const cameraId = Number(booking.camera_id);
  if (!Number.isInteger(cameraId) || cameraId < 1) {
    throw new PaymentValidationError('Camera non valida per il pagamento.');
  }

  if (!isValidDate(booking.data_inizio) || !isValidDate(booking.data_fine)) {
    throw new PaymentValidationError('Date prenotazione non valide.');
  }

  if (booking.data_fine <= booking.data_inizio) {
    throw new PaymentValidationError('Il check-out deve essere successivo al check-in.');
  }

  return {
    amount: Number(amount.toFixed(2)),
    amountCents: Math.round(amount * 100),
    currency,
    booking: {
      camera_id: cameraId,
      data_inizio: booking.data_inizio,
      data_fine: booking.data_fine
    }
  };
}

function simulatePaymentAuthorization(payment, user) {
  const validatedPayment = validatePaymentRequest(payment);

  // In produzione questo punto va sostituito con una vera API provider,
  // ad esempio Stripe Payment Intents API o PayPal Orders API.
  // Il frontend dovrebbe generare un token/metodo di pagamento sicuro
  // tramite SDK hosted fields; il backend non deve mai ricevere o salvare
  // numero della carta, CVV o dati sensibili equivalenti.
  return {
    success: true,
    stato: 'pagamento_simulato_autorizzato',
    messaggio: 'Autorizzazione pagamento simulata con successo',
    transactionId: createProviderId('SIM'),
    paymentIntentId: createProviderId('PI-DEMO'),
    provider: 'DemoPaymentGateway',
    providerStatus: 'authorized',
    authorized: true,
    captured: false,
    captureMode: 'manuale_demo',
    amount: validatedPayment.amount,
    amountCents: validatedPayment.amountCents,
    currency: validatedPayment.currency,
    customerReference: user?.id ? `USER-${user.id}` : null,
    paymentMethod: {
      type: 'tokenized_card',
      token: 'tok_demo_bnbhub',
      brand: 'Demo Card',
      last4: '4242'
    },
    booking: validatedPayment.booking,
    processedAt: new Date().toISOString(),
    integrationHint: 'Integrare una Payment Provider API reale per creare e confermare il payment intent.'
  };
}

module.exports = {
  PaymentValidationError,
  simulatePaymentAuthorization
};
