const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, UserController.getAll);
router.get('/:id', verifyToken, verifyAdmin, UserController.getById);

module.exports = router;
