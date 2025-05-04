const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const transactionsFile = path.join(__dirname, '../data/transactions.json');
const productsFile = path.join(__dirname, '../data/products.json');

const TRANSACTION_TYPES = ['sale', 'return', 'restock'];

// Helpers
async function loadTransactions() {
  try {
    return await fs.readJson(transactionsFile);
  } catch (err) {
    // If file doesn't exist, return empty array
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveTransactions(transactions) {
  await fs.writeJson(transactionsFile, transactions, { spaces: 2 });
}

async function loadProducts() {
  try {
    return await fs.readJson(productsFile);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveProducts(products) {
  await fs.writeJson(productsFile, products, { spaces: 2 });
}

// Controllers
exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await loadTransactions();
    res.json(transactions);
  } catch (err) {
    console.error('Error loading transactions:', err);
    next(err);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { productId, quantity, type } = req.body;

    // Validate productId
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing productId' });
    }

    // Validate quantity (coerce to number)
    const quantityNum = Number(quantity);
    if (Number.isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ error: 'Invalid quantity, must be a positive number' });
    }

    // Validate type
    if (!TRANSACTION_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type, must be one of: ${TRANSACTION_TYPES.join(', ')}` });
    }

    // Load products and find product
    const products = await loadProducts();
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[productIndex];

    // Process transaction
    let newQuantity;
    if (type === 'sale') {
      if (product.quantity < quantityNum) {
        return res.status(400).json({ error: 'Not enough stock' });
      }
      newQuantity = product.quantity - quantityNum;
    } else if (type === 'restock' || type === 'return') {
      newQuantity = product.quantity + quantityNum;
    }

    // Update prodcut
    const updatedProduct = { ...product, quantity: newQuantity };
    products[productIndex] = updatedProduct;

    // Save updated products
    await saveProducts(products);

    // Create transaction record
    const transactions = await loadTransactions();
    const newTransaction = {
      id: uuidv4(),
      productId,
      quantity: quantityNum,
      type,
      timestamp: new Date().toISOString()
    };

    transactions.push(newTransaction);
    await saveTransactions(transactions);

    res.status(201).json(newTransaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    next(err);
  }
};
