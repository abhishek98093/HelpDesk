const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Generates a JWT token with user details.
 * @param {Object} user - The user object.
 * @returns {string} JWT token valid for 1 hour.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      isAdmin: user.role === 'admin',
      role:user.role,
      id: user.id
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
};

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token.
 * @returns {Object} Decoded payload.
 * @throws {Error} If token is invalid or expired.
 */
const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

module.exports = { generateToken, verifyToken };
