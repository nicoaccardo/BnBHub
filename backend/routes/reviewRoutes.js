const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/public', ReviewController.getPublic);
router.post('/bookings/:bookingId', verifyToken, ReviewController.createForBooking);

router.get('/', verifyToken, verifyAdmin, ReviewController.getAll);
router.put('/:id/stato', verifyToken, verifyAdmin, ReviewController.updateStato);
router.put('/:id/visibilita', verifyToken, verifyAdmin, ReviewController.updateVisibilita);

module.exports = router;
