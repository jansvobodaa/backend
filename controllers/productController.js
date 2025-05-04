const fs = require('fs-extra');
const path = require('path');

const dataFile = path.join(__dirname, '../data/products.json');

// Helper functions
async function loadProducts() {
  return await fs.readJson(dataFile);
}

async function saveProducts(products) {
  await fs.writeJson(dataFile, products, { spaces: 2 });
}

// Controller methods
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await loadProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const products = await loadProducts();
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, quantity = 0, note = "", image = "" } = req.body;

    if (!name || typeof price !== "number" || typeof quantity !== "number") {
      return res.status(400).json({ error: "Invalid product data" });
    }

    const products = await loadProducts();
    const newProduct = {
      id: Date.now().toString(),
      name,
      price,
      quantity,
      note,
    };

    products.push(newProduct);
    await saveProducts(products);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const products = await loadProducts();
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).send('Product not found');

    const { name, price, quantity, note, image } = req.body;

    if (price !== undefined && typeof price !== 'number') {
      return res.status(400).send('Invalid price');
    }
    if (quantity !== undefined && typeof quantity !== 'number') {
      return res.status(400).send('Invalid quantity');
    }

    products[index] = {
      ...products[index],
      ...(name && { name }),
      ...(price !== undefined && { price }),
      ...(quantity !== undefined && { quantity }),
      ...(note !== undefined && { note }),
      ...(image !== undefined && { image })
    };

    await saveProducts(products);
    res.json(products[index]);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    let products = await loadProducts();
    const initialLength = products.length;
    products = products.filter(p => p.id !== req.params.id);

    if (products.length === initialLength) {
      return res.status(404).send('Product not found');
    }

    await saveProducts(products);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
