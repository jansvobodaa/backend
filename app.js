require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');

const app = express();
app.use(morgan('dev'));
const PORT = 3000;

app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('"Welcome to My Product Shop App API! Use /products or /transactions to get started."');
});
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
