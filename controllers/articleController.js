const Article = require('../models/articleModel');

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    console.log(articles);
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content, summary } = req.body;
    const article = new Article({
      title,
      content,
      summary,
      author: req.user._id // Assuming you have authentication middleware that sets req.user
    });
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: 'Error creating article', error: error.message });
  }
};

// You can add more controller functions here for updating, deleting, and getting a single article