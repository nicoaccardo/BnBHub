const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { verifyToken, verifyUser } = require('../middleware/authMiddleware');

// Endpoint demo: simula un'autorizzazione pagamento senza gateway reale.
// Per andare in produzione va collegata una Payment Provider API esterna.
router.post('/simulate', verifyToken, verifyUser, PaymentController.simulate);

module.exports = router;
