const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth'); // Assume you have this middleware


 

// Existing route for fetching aggregated carbon footprint data
router.get('/:period', async (req, res) => {
  const { period } = req.params;

  try {
    let query;
    let interval;
    
    switch(period) {
      case 'weekly':
        interval = 'INTERVAL 7 DAY';
        break;
      case 'monthly':
        interval = 'INTERVAL 30 DAY';
        break;
      case 'yearly':
        interval = 'INTERVAL 1 YEAR';
        break;
      default:
        return res.status(400).json({ message: 'Invalid period specified' });
    }

    query = `
      SELECT DATE(created_at) as date, SUM(carbon_footprint) as value
      FROM products
      WHERE created_at >= DATE_SUB(CURDATE(), ${interval})
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    const [results] = await db.query(query);
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching carbon footprint data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch user's carbon footprint
router.get('/user/carbon-footprint', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching footprint for user:', userId);
    const query = `
      SELECT SUM(carbon_footprint) as total_footprint
      FROM products
      WHERE user_id = ?
    `;
    const [results] = await db.query(query, [userId]);
    
    console.log('Query results:', results);

    if (results.length === 0 || results[0].total_footprint === null) {
      console.log('No footprint data found, returning 0');
      return res.json({ footprint: 0 });
    }

    console.log('Returning footprint:', results[0].total_footprint);
    res.json({ footprint: results[0].total_footprint });
  } catch (error) {
    console.error('Error fetching user carbon footprint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user's carbon footprint (this might need to be adjusted based on your app's logic)
router.put('/user/carbon-footprint', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { footprint } = req.body;

    if (typeof footprint !== 'number' || isNaN(footprint)) {
      return res.status(400).json({ message: 'Invalid footprint value' });
    }

    // This is a placeholder. You might need to adjust this based on how you want to update the footprint.
    // For now, it's just adding a new product with the given footprint.
    const query = 'INSERT INTO products (user_id, carbon_footprint) VALUES (?, ?)';
    await db.query(query, [userId, footprint]);

    res.json({ message: 'Carbon footprint updated successfully', footprint });
  } catch (error) {
    console.error('Error updating user carbon footprint:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// New route for searching products
router.get('/products/search', async (req, res) => {
  const { q } = req.query; // Get the search query from the request

  try {
    const query = `
      SELECT id, name, company, type, carbon_footprint
      FROM products
      WHERE name LIKE ? OR company LIKE ?
    `;
    const searchTerm = `%${q}%`;
    const [results] = await db.query(query, [searchTerm, searchTerm]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;