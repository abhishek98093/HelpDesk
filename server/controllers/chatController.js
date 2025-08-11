const pool = require('../config/db');

const saveChatMessage = async (userId, message, fromRole) => {
  try {
    const query = 'INSERT INTO chat (user_id, message, from_role) VALUES ($1, $2, $3)';
    const values = [userId, message, fromRole];

    await pool.query(query, values); 
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error; 
  }
};

module.exports = saveChatMessage;
