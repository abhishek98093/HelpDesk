// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const saveChatMessage = require("../controllers/chatController");
const db = require('../config/db'); // PostgreSQL pool

// Save chat message
router.post('/', async (req, res) => {
  const { userId, message, from_role } = req.body;
  console.log(req.body);

  if (!userId || !message || !from_role) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  try {
    await saveChatMessage(userId, message, from_role);
    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Fetch chat messages for a user
router.get('/', async (req, res) => {
  const userId = parseInt(req.query.user_id, 10);
  const limit = parseInt(req.query.limit, 10) || 20;

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Valid user_id is required.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM chat WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    // Reverse so oldest → newest
    const messages = result.rows.reverse();
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// Get all unique chat users
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM chat c
       JOIN users u ON c.user_id = u.id
       ORDER BY u.name`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
