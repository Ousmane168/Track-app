const db = require('../config/database');

   module.exports = async function(req, res, next) {
     try {
       if (!req.user) {
         console.log('No user object in request');
         return res.status(401).json({ message: 'Authentication required' });
       }

       console.log('Checking admin status for user:', req.user.id);

       const [rows] = await db.query('SELECT is_admin FROM users WHERE id = ?', [req.user.id]);

       console.log('Database result:', rows);

       if (rows.length === 0 || !rows[0].is_admin) {
         console.log('User is not an admin');
         return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
       }

       console.log('User is an admin, proceeding...');
       next();
     } catch (error) {
       console.error('Error in isAdmin middleware:', error);
       res.status(500).json({ message: 'Server error', error: error.message });
     }
   };