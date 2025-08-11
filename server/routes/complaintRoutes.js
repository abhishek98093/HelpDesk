const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // PostgreSQL pool
const upload = require("../utils/upload");
// 📌 Submit complaint
router.post("/complaints", upload.array("attachments"), async (req, res) => {
  try {
    const { user_id, type, message, status ,location,priority} = req.body; // ✅ match table columns
    const attachments = req.files?.map(file => file.path) || [];

    const result = await pool.query(
      `INSERT INTO complaints (user_id, type, message, status, attachments,location,priority) 
       VALUES ($1, $2, $3, $4, $5,$6,$7) RETURNING *`,
      [user_id, type, message, status || "Pending", JSON.stringify(attachments),location,priority]
    );

    res.status(201).json({ success: true, complaint: result.rows[0] });
  } catch (err) {
    console.error("❌ Error submitting complaint:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 📌 Get all complaints
router.get("/complaints", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching complaints:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 📌 Get complaints for a user by email
router.get("/complaints/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const result = await pool.query(
      `SELECT c.* 
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       WHERE u.email = $1
       ORDER BY c.created_at DESC`,
      [email]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching user complaints:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 📌 Assign complaint
router.put("/complaints/:id/assign", async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { assigned_personnel_id } = req.body; // ✅ match DB column
    await pool.query(
      `UPDATE complaints SET assigned_personnel_id = $1, status = 'Assigned' WHERE id = $2`,
      [assigned_personnel_id, complaintId]
    );
    res.status(200).json({ success: true, message: "Complaint assigned successfully." });
  } catch (err) {
    console.error("❌ Error assigning complaint:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 📌 Update complaint status
router.patch("/complaints/:id", async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status } = req.body;
    await pool.query(
      `UPDATE complaints SET status = $1 WHERE id = $2`,
      [status || "Resolved", complaintId]
    );
    res.status(200).json({ success: true, message: "Complaint updated successfully." });
  } catch (err) {
    console.error("❌ Error resolving complaint:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 📌 Track complaint
router.post("/complaints/track", async (req, res) => {
  try {
    const { complaint_id } = req.body;
    const result = await pool.query(
      `SELECT * FROM complaints WHERE id = $1`,
      [complaint_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error tracking complaint:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// 📌 Get complaint types
router.get("/complaint_types", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM complaint_types ORDER BY type_name ASC"); // ✅ match column
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching complaint types:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
