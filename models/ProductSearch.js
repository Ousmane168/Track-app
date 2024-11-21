const db = require('../config/database');

const ProductSearch = {
  create: async (productData) => {
    const query = `
      INSERT INTO product_search 
      (user_id, product_id, name, company, type, carbon_footprint) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      productData.user_id,
      productData.product_id,
      productData.name,
      productData.company,
      productData.type,
      productData.carbon_footprint
    ];

    try {
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Error in ProductSearch.create:', error);
      throw error;
    }
  },

  findAllByUserId: async (userId) => {
    console.log('user_id in ProductSearch', userId);
    
    const [rows] = await db.query('SELECT * FROM product_search WHERE user_id = ?', [userId]);
    return rows;
  },

  delete: async (id, userId) => {
    const [result] = await db.query('DELETE FROM product_search WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows;
  }
};

module.exports = ProductSearch;