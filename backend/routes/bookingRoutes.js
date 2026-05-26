const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Utente autenticato — le proprie prenotazioni
router.get('/mie', verifyToken, (req, res) => {
  req.params.utente_id = req.user.id;
  BookingController.getByUtente(req, res);
});

// Crea una prenotazione
router.post('/', verifyToken, BookingController.create);

// Utente autenticato â€” gestione delle proprie prenotazioni
router.put('/mie/:id/info-soggiorno', verifyToken, BookingController.updateGuestInfo);
router.put('/mie/:id/cancella', verifyToken, BookingController.cancelMine);

// Solo admin
router.get('/', verifyToken, verifyAdmin, BookingController.getAll);
router.get('/:id', verifyToken, verifyAdmin, BookingController.getById);
router.put('/:id/stato', verifyToken, verifyAdmin, BookingController.updateStato);

module.exports = router;
