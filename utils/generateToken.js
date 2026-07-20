// utils/generateToken.js
// Purpose: One place to create JWTs, so the signing logic (secret,
// expiry, payload shape) isn't duplicated across controllers.

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
