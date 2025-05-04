const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', 
  param('id').isString().notEmpty(),
  productController.getProductById
);

// Create new product
router.post('/',
  body('name').isString().notEmpty(),
  body('price').isNumeric(),
  productController.createProduct
);

// Update product
router.put('/:id',
  param('id').isString().notEmpty(),
  body('name').optional().isString(),
  body('price').optional().isNumeric(),
  productController.updateProduct
);

// Delete product
router.delete('/:id', 
  param('id').isString().notEmpty(),
  productController.deleteProduct
);

module.exports = router;
