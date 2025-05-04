const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);

router.post('/',
  body('productId').isString().notEmpty(),
  body('quantity').isNumeric(),
  body('type').isIn(['sale', 'return', 'restock']),
  transactionController.createTransaction
);

module.exports = router;
