const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Product = require('../models/product');
const auth = require('../middleware/auth');
const ProductSearch = require('../models/ProductSearch');  // Adjust path as necessary


router.post('/user-search-products', auth, async (req, res) => {
  console.log('POST /user-search-products: Request received');
  try {
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);

    const { product_id, name, company, type, carbon_footprint } = req.body;
    const userId = req.user.id;

    console.log('Extracted data:', { userId, product_id, name, company, type, carbon_footprint });

    // Validation
    if (!product_id || !name || !company || !type || carbon_footprint === undefined) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Creating new product search entry');
    const [result] = await db.query(
      'INSERT INTO product_search (user_id, product_id, name, company, type, carbon_footprint) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, product_id, name, company, type, parseFloat(carbon_footprint)]
    );

    console.log('New product created with ID:', result.insertId);

    // Fetch the newly created product (optional)
    console.log('Fetching newly created product');
    const [newProduct] = await db.query(
      'SELECT * FROM product_search WHERE id = ?',
      [result.insertId]
    );

    console.log('Fetched new product:', newProduct);

    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct[0] // Access the first (and likely only) product in the result array
    });
  } catch (error) {
    console.error('Error in POST /user-search-products:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


router.get('/user-search-products', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userProducts = await ProductSearch.findAllByUserId(userId);
    console.log('userProducts variable in Products.js', userProducts);
    
    res.json(userProducts);
  } catch (error) {
    console.error('Error fetching user search products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/user-search-products/:id', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const result = await ProductSearch.delete(productId, userId);
    if (result === 0) {
      return res.status(404).json({ message: 'Product not found or not authorized to delete' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting user search product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search route should be before other routes that use path parameters
router.get('/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const [products] = await db.query(
      `SELECT * FROM products WHERE name LIKE ? OR company LIKE ? OR type LIKE ?`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/info', async (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  try {
    const [products] = await db.query(
      `SELECT p.*, 
        GROUP_CONCAT(DISTINCT CASE WHEN i.is_harmful THEN i.name ELSE NULL END) AS harmful_ingredients,
        GROUP_CONCAT(DISTINCT i.name) AS all_ingredients
       FROM products p
       LEFT JOIN product_ingredients pi ON p.id = pi.product_id
       LEFT JOIN ingredients i ON pi.ingredient_id = i.id
       WHERE p.name LIKE ?
       GROUP BY p.id`,
      [`%${name}%`]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];
    product.harmful_ingredients = product.harmful_ingredients ? product.harmful_ingredients.split(',') : [];
    product.all_ingredients = product.all_ingredients ? product.all_ingredients.split(',') : [];

    res.json(product);
  } catch (error) {
    console.error('Error fetching product info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all products for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.findByUserId(req.user.id);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).send('Server Error');
  }
});

// Add a new product
// Add a new product
router.post('/', auth, async (req, res) => {
  const { name, company, type, carbon_footprint } = req.body;

  try {
    console.log('Attempting to create product:', { name, company, type, carbon_footprint, userId: req.user.id });
    const productId = await Product.create(name, company, type, carbon_footprint, req.user.id);
    console.log('Product created with ID:', productId);
    const newProduct = await Product.findById(productId);
    console.log('Fetched new product:', newProduct);
    res.json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    console.error('Error details:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update a product
router.patch('/:id', auth, async (req, res) => {
  const { name, company, type, carbon_footprint } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if the product belongs to the user
    if (product.user_id !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedRows = await Product.update(req.params.id, name, company, type, carbon_footprint);
    
    if (updatedRows > 0) {
      const updatedProduct = await Product.findById(req.params.id);
      res.json(updatedProduct);
    } else {
      res.status(404).json({ msg: 'Product not found' });
    }
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a product
router.delete('/:id', auth, async (req, res) => {
  // console.log('Delete route accessed');
  // console.log('Request params:', req.params);

  try {
    const productId = req.params.id;
    console.log('Attempting to find product with ID:', productId);

    const product = await Product.findById(productId);
    console.log('Product found:', product);

    if (!product) {
      console.log('Product not found in database');
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.user_id !== req.user.id) {
      console.log('User not authorized to delete this product');
      console.log('Product user_id:', product.user_id);
      console.log('Request user.id:', req.user.id);
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    console.log('Attempting to delete product');
    const result = await Product.delete(productId);
    console.log('Delete result:', result);

    if (result === 0) {
      return res.status(404).json({ message: 'Product not found or already deleted' });
    }

    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error in delete product route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;