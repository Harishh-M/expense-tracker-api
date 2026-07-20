// middleware/authMiddleware.js
// Purpose: Guards private routes. Any route that uses `protect` will
// only run its controller if a valid JWT is provided in the request.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Standard convention: token is sent as "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // "Bearer abcdef123..." -> split by space -> take the token part
      token = req.headers.authorization.split(' ')[1];

      // Verify signature + expiry using the same secret used to sign it.
      // Throws an error if invalid/expired.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the logged-in user to the request object (minus password)
      // so every controller after this middleware can access req.user.
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User belonging to this token no longer exists');
      }

      return next(); // move on to the actual controller
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token failed or expired'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

module.exports = { protect };
