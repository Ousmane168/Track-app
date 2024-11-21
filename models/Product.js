const db = require('../config/database');

class Product {
  static async create(name, company, type, carbon_footprint, userId) {
    try {
      console.log('Creating product with data:', { name, company, type, carbon_footprint, userId });
      const [result] = await db.execute(
        'INSERT INTO products (name, company, type, carbon_footprint, user_id) VALUES (?, ?, ?, ?, ?)',
        [name, company, type, carbon_footprint, userId]
      );
      console.log('Insert result:', result);
      return result.insertId;
    } catch (error) {
      console.error('Error in Product.create:', error);
      throw error;  // Re-throw the error so it can be caught in the route handler
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT * FROM products WHERE id = ?';
      console.log('Executing query:', query, 'with id:', id);
      const [rows] = await db.execute(query, [id]);
      console.log('FindById query result:', rows);
      return rows[0];
    } catch (error) {
      console.error('Error in Product.findById:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM products WHERE user_id = ?', [userId]);
    return rows;
  }

  static async update(id, name, company, type, carbon_footprint) {
    const [result] = await db.execute(
      'UPDATE products SET name = ?, company = ?, type = ?, carbon_footprint = ? WHERE id = ?',
      [name, company, type, carbon_footprint, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    console.log('Product.delete called with id:', id);
    try {
      const query = 'DELETE FROM products WHERE id = ?';
      console.log('Executing query:', query);
      console.log('Query parameters:', [id]);
      const [result] = await db.execute(query, [id]);
      console.log('Delete query result:', result);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in Product.delete:', error);
      throw error;
    }
  }
}



module.exports = Product;