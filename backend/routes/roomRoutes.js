const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/roomController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { uploadRoomImages } = require('../middleware/roomUpload');

// Pubbliche — visibili a tutti
router.get('/', RoomController.getAll);
router.get('/disponibili', RoomController.getDisponibili);
router.get('/:id', RoomController.getById);

// Protette — solo admin
router.post('/', verifyToken, verifyAdmin, uploadRoomImages, RoomController.create);
router.put('/:id', verifyToken, verifyAdmin, uploadRoomImages, RoomController.update);
router.delete('/:id', verifyToken, verifyAdmin, RoomController.deleteById);

module.exports = router;
