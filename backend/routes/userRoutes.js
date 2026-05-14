const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, UserController.getAll);
router.get('/:id', verifyToken, UserController.getById);
router.post('/', verifyToken, UserController.create);
router.delete('/:id', verifyToken, verifyAdmin, UserController.deleteById);

module.exports = router;