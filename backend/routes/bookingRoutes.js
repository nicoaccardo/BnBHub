const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { verifyToken, verifyAdmin, verifyUser } = require('../middleware/authMiddleware');

// Utente autenticato — le proprie prenotazioni
router.get('/mie', verifyToken, verifyUser, (req, res) => {
  req.params.utente_id = req.user.id;
  BookingController.getByUtente(req, res);
});

// Crea una prenotazione
router.post('/', verifyToken, verifyUser, BookingController.create);

// Utente autenticato â€” gestione delle proprie prenotazioni
router.put('/mie/:id/info-soggiorno', verifyToken, verifyUser, BookingController.updateGuestInfo);
router.put('/mie/:id/cancella', verifyToken, verifyUser, BookingController.cancelMine);

// Solo admin
router.get('/', verifyToken, verifyAdmin, BookingController.getAll);
router.get('/:id', verifyToken, verifyAdmin, BookingController.getById);
router.put('/:id/stato', verifyToken, verifyAdmin, BookingController.updateStato);

module.exports = router;
