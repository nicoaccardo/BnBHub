const {
  PaymentValidationError,
  simulatePaymentAuthorization
} = require('../services/paymentGatewayService');

const DEMO_PAYMENT_RESPONSE_DELAY_MS = 1500;

const PaymentController = {
  simulate: (req, res) => {
    try {
      const payment = simulatePaymentAuthorization(req.body, req.user);
      return setTimeout(() => {
        res.json(payment);
      }, DEMO_PAYMENT_RESPONSE_DELAY_MS);
    } catch (err) {
      if (err instanceof PaymentValidationError) {
        return res.status(400).json({
          success: false,
          stato: 'pagamento_simulato_non_valido',
          errore: err.message
        });
      }

      return res.status(500).json({
        success: false,
        stato: 'errore_pagamento_simulato',
        errore: 'Errore tecnico durante la simulazione del pagamento'
      });
    }
  }
};

module.exports = PaymentController;
