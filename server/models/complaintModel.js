require("dotenv").config();
const pool = require("../config/db");
const generateCode = () => Math.floor(1000 + Math.random() * 9000);

const { 
  sendTicketSubmissionMail, 
  adminAssignedPersonnelMail, 
  complaintResolvedMail 
} = require("../utils/mailer");

// Get all complaints
const getAll = async () => {
  const sql = `
    SELECT 
      c.*, 
      u.name AS name,
      u.email AS email,
      p.name AS assigned_name, 
      p.contact AS assigned_contact,
      ct.type_name AS complaint_type
    FROM complaints c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN personnel p ON c.assigned_personnel_id = p.id
    LEFT JOIN complaint_types ct ON c.complaint_type_id = ct.id
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

// Create a complaint
const createComplaint = async (complaint) => {
  const { name, email, priority, location, type, message, attachments } = complaint;
  const code = generateCode();

  const sql = `
    INSERT INTO complaints 
      (priority, location, complaint_type_id, message, attachments, code, user_id)
    VALUES (
      $1, $2, 
      (SELECT id FROM complaint_types WHERE type_name = $3 LIMIT 1),
      $4, $5, $6, 
      (SELECT id FROM users WHERE email = $7 LIMIT 1)
    )
    RETURNING id;
  `;

  const { rows } = await pool.query(sql, [
    priority, location, type, message, attachments, code, email
  ]);

  await sendTicketSubmissionMail(email, name, type, code);
  return rows[0];
};

// Get complaints for a specific user
const getUserComplaint = async (email) => {
  const userRes = await pool.query(
    "SELECT id FROM users WHERE email = $1", [email]
  );

  if (userRes.rowCount === 0) {
    throw new Error("User not found");
  }

  const userId = userRes.rows[0].id;

  const q = `
    SELECT 
      c.*, 
      ct.type_name AS type, 
      f.rating AS feedback, 
      p.name AS assigned_personnel_name
    FROM complaints c
    LEFT JOIN complaint_types ct ON c.complaint_type_id = ct.id
    LEFT JOIN feedback f ON f.complaint_id = c.id
    LEFT JOIN personnel p ON c.assigned_personnel_id = p.id
    WHERE c.user_id = $1
  `;
  const { rows } = await pool.query(q, [userId]);
  return rows;
};

// Assign personnel
const assignPersonnel = async (id, assignedName, assignedContact) => {
  const personnelRes = await pool.query(
    `SELECT id FROM personnel WHERE name = $1 AND contact = $2`,
    [assignedName, assignedContact]
  );

  if (personnelRes.rowCount === 0) return null;

  const personnelId = personnelRes.rows[0].id;

  await pool.query(
    `UPDATE complaints SET assigned_personnel_id = $1, status = 'Assigned' WHERE id = $2`,
    [personnelId, id]
  );

  await pool.query(
    `UPDATE personnel SET available = false WHERE id = $1`,
    [personnelId]
  );

  const userDetailsRes = await pool.query(`
    SELECT u.name, u.email, ct.type_name
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    JOIN complaint_types ct ON c.complaint_type_id = ct.id
    WHERE c.id = $1
  `, [id]);

  if (userDetailsRes.rowCount > 0) {
    const { name, email, type_name } = userDetailsRes.rows[0];
    await adminAssignedPersonnelMail(email, name, type_name, assignedName, assignedContact);
  }

  return true;
};

// Mark complaint as resolved
const markResolved = async (id) => {
  const detailsRes = await pool.query(`
    SELECT c.assigned_personnel_id, u.name, u.email, ct.type_name
    FROM complaints c
    JOIN users u ON c.user_id = u.id
    JOIN complaint_types ct ON c.complaint_type_id = ct.id
    WHERE c.id = $1
  `, [id]);

  if (detailsRes.rowCount === 0) {
    throw new Error("Complaint not found");
  }

  const { assigned_personnel_id: personnelId, name, email, type_name: type } = detailsRes.rows[0];

  await pool.query(`UPDATE complaints SET status = 'Resolved' WHERE id = $1`, [id]);

  await complaintResolvedMail(email, name, type);

  if (personnelId) {
    await pool.query(`UPDATE personnel SET available = true WHERE id = $1`, [personnelId]);
  }

  return true;
};

// Track ticket by code
const trackTicket = async (email, code) => {
  const sql = `
    SELECT c.status, 
           p.name AS personnel_name, 
           p.contact AS personnel_contact 
    FROM complaints c 
    JOIN users u ON c.user_id = u.id
    LEFT JOIN personnel p ON c.assigned_personnel_id = p.id 
    WHERE u.email = $1 AND c.code = $2
  `;
  const { rows } = await pool.query(sql, [email, code]);
  return rows;
};

// Get complaint types
const getComplaintTypes = async () => {
  const { rows } = await pool.query("SELECT id, type_name FROM complaint_types");
  return rows;
};

module.exports = {
  getAll, 
  createComplaint, 
  getUserComplaint, 
  assignPersonnel, 
  markResolved, 
  trackTicket, 
  getComplaintTypes
};
