const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/aggregate-carbon-footprint/:period', async (req, res) => {
  const { period } = req.params;
  console.log('Received request for period:', period);

  try {
    let query;
    if (period === 'weekly') {
      query = `SELECT DATE(created_at) as date, SUM(carbon_footprint) as value
               FROM products
               WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
               GROUP BY DATE(created_at)
               ORDER BY date`;
    } else if (period === 'monthly') {
      query = `SELECT DATE(created_at) as date, SUM(carbon_footprint) as value
               FROM products
               WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
               GROUP BY DATE(created_at)
               ORDER BY date`;
    } else if (period === 'yearly') {
      query = `SELECT DATE_FORMAT(created_at, '%Y-%m') as date, SUM(carbon_footprint) as value
               FROM products
               WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
               GROUP BY DATE_FORMAT(created_at, '%Y-%m')
               ORDER BY date`;
    } else {
      return res.status(400).json({ message: 'Invalid period specified' });
    }

    console.log('Executing query:', query);

    const [results] = await db.query(query);
    
    console.log('Query results:', results);

    res.json(results);
  } catch (error) {
    console.error('Error fetching aggregate carbon footprint data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// list of ingredients
// Get all ingredients
router.get('/ingredients', auth, async (req, res) => {
  try {
    const [ingredients] = await db.query('SELECT * FROM ingredients');
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new ingredient
router.post('/ingredients', auth, isAdmin, async (req, res) => {
  try {
    const { name, is_harmful } = req.body;
    
    if (!name || is_harmful === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [result] = await db.query(
      'INSERT INTO ingredients (name, is_harmful) VALUES (?, ?)',
      [name, is_harmful]
    );
    
    res.status(201).json({ id: result.insertId, name, is_harmful });
  } catch (error) {
    console.error('Error adding ingredient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an ingredient
router.delete('/ingredients/:id', auth, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM ingredients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete a user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all articles
router.get('/articles', auth, isAdmin, async (req, res, next) => {
  try {
    const [articles] = await db.query('SELECT * FROM articles');
    res.json(articles);
  } catch (error) {
    next(error);
  }
});


// Add a new article
router.post('/articles', auth, isAdmin, async (req, res, next) => {
  try {
    const { title, content, link } = req.body;
    const [result] = await db.query(
      'INSERT INTO articles (title, content, link) VALUES (?, ?, ?)',
      [title, content, link]
    );
    res.status(201).json({ id: result.insertId, title, content, link });
  } catch (error) {
    next(error);
  }
});

// Update an article
router.put('/articles/:id', auth, isAdmin, async (req, res) => {
  try {
    const { title, content, link } = req.body;
    await db.query('UPDATE articles SET title = ?, content = ?, link = ? WHERE id = ?', [title, content, link, req.params.id]);
    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete an article
router.delete('/articles/:id', auth, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Product Routes
router.get('/products', auth, async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// add new product
router.post('/products', auth, isAdmin, async (req, res) => {
  try {
    const { name, company, type, carbon_footprint } = req.body;
    
    if (!name || !company || !type || carbon_footprint === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [result] = await db.query(
      'INSERT INTO products (name, company, type, carbon_footprint) VALUES (?, ?, ?, ?)',
      [name, company, type, parseFloat(carbon_footprint)]
    );
    
    res.status(201).json({ id: result.insertId, name, company, type, carbon_footprint });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;