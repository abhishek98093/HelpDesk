const pool = require('../config/db'); // PostgreSQL pool

// Get all personnels
const getPersonnels = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM personnel");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching personnel:", err);
    res.status(500).json({ success: false, message: "Error fetching personnel" });
  }
};

// Get available personnels by role
const getAvailablePersonnels = async (req, res) => {
  const { role } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM personnel WHERE role = $1 AND is_available = TRUE",
      [role]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching available personnel:", err);
    res.status(500).json({ success: false, message: "Error fetching available personnel" });
  }
};

// Add new personnel
const addPersonnels = async (req, res) => {
  const { name, contact, role } = req.body;

  if (!name || !contact || !role) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    await pool.query(
      "INSERT INTO personnel (name, contact, role) VALUES ($1, $2, $3)",
      [name, contact, role]
    );
    res.json({ success: true, message: "Personnel added successfully" });
  } catch (err) {
    console.error("Error adding personnel:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { 
  getPersonnels, 
  getAvailablePersonnels, 
  addPersonnels 
};
