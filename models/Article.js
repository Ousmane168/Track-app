const db = require('../config/database');

const Article = {
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
    return rows;
  },

  create: async (articleData) => {
    const query = `
      INSERT INTO articles 
      (title, content, summary, author_id) 
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      articleData.title,
      articleData.content,
      articleData.summary,
      articleData.author_id
    ];

    try {
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Error in Article.create:', error);
      throw error;
    }
  },

  // You can add more methods here as needed, such as findById, update, delete, etc.
};

module.exports = Article;