const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const db = require('../config/database');

// Route to change password
router.put('/change-password', auth, async (req, res) => {
    try {
      const { newPassword } = req.body;
  
      if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
      }
  
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update password in database
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.userId]);
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

router.put('/profile', auth, async (req, res) => {
    try {
      const { username, email } = req.body;
  
      // Update user in database
      await db.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.user.userId]);
  
      // Fetch updated user data
      const [users] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'Profile updated successfully', user: users[0] });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/user-status', auth, async (req, res) => {
    try {
      const [users] = await db.query('SELECT id, email, is_admin FROM users WHERE id = ?', [req.user.id]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];
      res.json({ id: user.id, email: user.email, isAdmin: user.is_admin });
    } catch (error) {
      console.error('Error fetching user status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;