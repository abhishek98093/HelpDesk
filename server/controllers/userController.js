// const pool = require('../config/db'); // PostgreSQL pool
// const crypto = require("crypto");
// const { sendForgotPasswordMail } = require("../utils/mailer");
// const jwt = require('jsonwebtoken');
// require("dotenv").config();
// const bcrypt = require('bcrypt');
// const { userSchema } = require('../schemas/userSchema');
// const { feedbackSchema } = require('../schemas/feedbackSchema');
// const SECRET_KEY = process.env.SECRET_KEY;

// const resetTokens = {}; // In-memory store for reset tokens

// // LOGIN
// const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (result.rows.length === 0) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
    
//     const user = result.rows[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }



//     const token = jwt.sign(
//       { name: user.name, email: user.email, isAdmin: user.role === 'admin', id: user.id },
//       SECRET_KEY,
//       { expiresIn: '1h' }
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // SIGNUP
// const signup = async (req, res) => {
//   console.log('api hit');
//   const parseResult = userSchema.safeParse(req.body);
//   if (!parseResult.success) {
//     return res.status(400).json({
//       success: false,
//       message: "Validation error.",
//       errors: parseResult.error.errors,
//     });
//   }

//   const { name, email, password } = parseResult.data;
//   try {
//     const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     await pool.query(
//       "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
//       [name, email, hashedPassword, 'user']
//     );

//     const token = jwt.sign({ name, email, isAdmin: false }, SECRET_KEY, { expiresIn: '1h' });
//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       token,
//       user: { name, email, isAdmin: false },
//     });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ success: false, error: "Something went wrong" });
//   }
// };

// // GET USER DETAILS
// const userDetails = async (req, res) => {
//   const { email } = req.params;
//   try {
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     res.json({ success: true, user: result.rows[0] });
//   } catch (err) {
//     console.error("Error fetching user:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // SUBMIT FEEDBACK
// const feedback = async (req, res) => {
//   const parseResult = feedbackSchema.safeParse(req.body);
//   if (!parseResult.success) {
//     return res.status(400).json({
//       success: false,
//       message: "Validation error.",
//       errors: parseResult.error.errors,
//     });
//   }

//   const { complaint_id, user_id, assigned_personnel_id, rating, comment } = parseResult.data;

//   try {
//     const existing = await pool.query(
//       "SELECT id FROM feedback WHERE complaint_id = $1",
//       [complaint_id]
//     );
//     if (existing.rows.length > 0) {
//       return res.status(400).json({ success: false, message: "Feedback already submitted." });
//     }

//     await pool.query(
//       "INSERT INTO feedback (complaint_id, user_id, assigned_personnel_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
//       [complaint_id, user_id, assigned_personnel_id, rating, comment]
//     );

//     await pool.query(
//       "UPDATE complaints SET feedback_given = TRUE WHERE id = $1",
//       [complaint_id]
//     );

//     res.status(200).json({ success: true, message: "Feedback submitted successfully." });
//   } catch (err) {
//     console.error("Feedback error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // FORGOT PASSWORD
// const ForgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const result = await pool.query("SELECT name FROM users WHERE email = $1", [email]);
//     if (result.rows.length === 0) {
//       return res.status(404).send("User not found");
//     }

//     const token = crypto.randomBytes(32).toString("hex");
//     const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour
//     resetTokens[token] = { email, expiresAt };

//     const resetLink = `http://localhost:5173/reset-password/${token}`;
//     console.log(resetLink);

//     await sendForgotPasswordMail(email, result.rows[0].name, resetLink);
//     res.json({ success: true });
//   } catch (err) {
//     console.error("ForgotPassword error:", err);
//     res.status(500).send("Error sending reset email.");
//   }
// };

// // RESET PASSWORD
// const ResetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;
//   const entry = resetTokens[token];

//   if (!entry || entry.expiresAt < Date.now()) {
//     return res.status(400).send("Invalid or expired token.");
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
//       hashedPassword,
//       entry.email,
//     ]);

//     delete resetTokens[token];
//     res.send("Password has been reset successfully. You can now log in.");
//   } catch (err) {
//     console.error("ResetPassword error:", err);
//     res.status(500).json({ error: "Database error while resetting password." });
//   }
// };

// module.exports = {
//   login,
//   signup,
//   userDetails,
//   feedback,
//   ForgotPassword,
//   ResetPassword,
// };


const pool = require('../config/db'); // PostgreSQL pool
const crypto = require("crypto");
const { sendForgotPasswordMail } = require("../utils/mailer");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const bcrypt = require('bcrypt');
const { userSchema } = require('../schemas/userSchema');
const { feedbackSchema } = require('../schemas/feedbackSchema');
const SECRET_KEY = process.env.SECRET_KEY;

const resetTokens = {}; // In-memory store for reset tokens

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Make sure we have a hashed password in DB
    const isMatch = user.password && await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { name: user.name, email: user.email, isAdmin: user.role === 'admin', id: user.id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.role === 'admin' }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// SIGNUP
const signup = async (req, res) => {
  console.log('Signup API hit');
  const parseResult = userSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error.",
      errors: parseResult.error.errors,
    });
  }

  let { name, email, password } = parseResult.data;
  name = name.trim();
  email = email.trim().toLowerCase();

  try {
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, hashedPassword, 'user']
    );

    const token = jwt.sign({ name, email, isAdmin: false, id: insertResult.rows[0].id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: insertResult.rows[0].id, name, email, isAdmin: false },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, error: "Something went wrong" });
  }
};

// GET USER DETAILS
const userDetails = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query("SELECT id, name, email, role FROM users WHERE email = $1", [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// SUBMIT FEEDBACK
const feedback = async (req, res) => {
  const parseResult = feedbackSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error.",
      errors: parseResult.error.errors,
    });
  }

  const { complaint_id, user_id, assigned_personnel_id, rating, comment } = parseResult.data;

  try {
    const existing = await pool.query(
      "SELECT id FROM feedback WHERE complaint_id = $1",
      [complaint_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Feedback already submitted." });
    }

    await pool.query(
      "INSERT INTO feedback (complaint_id, user_id, assigned_personnel_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
      [complaint_id, user_id, assigned_personnel_id, rating, comment]
    );

    await pool.query(
      "UPDATE complaints SET feedback_given = TRUE WHERE id = $1",
      [complaint_id]
    );

    res.status(200).json({ success: true, message: "Feedback submitted successfully." });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// FORGOT PASSWORD
const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query("SELECT name FROM users WHERE email = $1", [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour
    resetTokens[token] = { email, expiresAt };

    const resetLink = `http://localhost:5173/reset-password/${token}`;
    console.log("Password reset link:", resetLink);

    await sendForgotPasswordMail(email, result.rows[0].name, resetLink);
    res.json({ success: true });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).send("Error sending reset email.");
  }
};

// RESET PASSWORD
const ResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const entry = resetTokens[token];

  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).send("Invalid or expired token.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      entry.email.trim(),
    ]);

    delete resetTokens[token];
    res.send("Password has been reset successfully. You can now log in.");
  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ error: "Database error while resetting password." });
  }
};

module.exports = {
  login,
  signup,
  userDetails,
  feedback,
  ForgotPassword,
  ResetPassword,
};
