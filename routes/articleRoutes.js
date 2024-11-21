const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, admin } = require('../middleware/authMiddleware');

console.log('i am in articles Route');

// Route to get all articles (public)
// router.get('/', articleController.getAllArticles);


// You can add more routes here for updating, deleting, and getting a single article

module.exports = router;