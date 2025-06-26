const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Todas estas rutas están protegidas por el middleware de autenticación
router.post('/:userId', authMiddleware, transactionController.addTransaction);
router.get('/:userId', authMiddleware, transactionController.getTransactions);
router.get('/:userId/balance', authMiddleware, transactionController.getBalance);

module.exports = router;