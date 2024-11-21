const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user info in request
    req.user = {
      id: decoded.userId,
      // Add any other user info you need
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};