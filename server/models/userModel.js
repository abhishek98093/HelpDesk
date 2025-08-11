const pool = require("../config/db"); // PostgreSQL pool

const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(query, [email]);
  return rows;
};

const createUser = async (name, email, hashedPassword, role) => {
  const query = "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)";
  const { rowCount } = await pool.query(query, [name, email, hashedPassword, role]);
  return rowCount;
};

const getUserDetailsByEmail = async (email) => {
  const query = "SELECT name, email FROM users WHERE email = $1";
  const { rows } = await pool.query(query, [email]);
  return rows;
};

const checkExistingFeedback = async (complaint_id) => {
  const query = "SELECT id FROM feedback WHERE complaint_id = $1";
  const { rows } = await pool.query(query, [complaint_id]);
  return rows;
};

const insertFeedback = async (complaint_id, user_id, assigned_personnel_id, rating, comment) => {
  const query = `
    INSERT INTO feedback (complaint_id, user_id, assigned_personnel_id, rating, comment)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const { rowCount } = await pool.query(query, [
    complaint_id,
    user_id,
    assigned_personnel_id,
    rating,
    comment
  ]);
  return rowCount;
};

const markFeedbackGiven = async (complaint_id) => {
  const query = "UPDATE complaints SET feedback_given = TRUE WHERE id = $1";
  const { rowCount } = await pool.query(query, [complaint_id]);
  return rowCount;
};

module.exports = {
  createUser,
  findUserByEmail,
  getUserDetailsByEmail,
  checkExistingFeedback,
  insertFeedback,
  markFeedbackGiven
};
