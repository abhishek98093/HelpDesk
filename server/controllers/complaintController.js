const {
  createComplaint,
  getAll,
  getUserComplaint,
  assignPersonnel,
  markResolved,
  trackTicket,
  getComplaintTypes
} = require('../models/complaintModel');

const submitComplaint = async (req, res) => {
  try {
    const { name, email, priority, location, type, message } = req.body;
    const attachments = req.files?.map((file) => file.filename).join(",") || "";

    if (!name || !email || !priority || !location || !type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    const complaint = { name, email, priority, location, type, message, attachments };
    await createComplaint(complaint);

    res.status(201).json({
      success: true,
      message: "Ticket submitted and email sent."
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error submitting complaint'
    });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const results = await getAll();
    res.json({ success: true, data: results });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch complaints" });
  }
};

const getUserComplaints = async (req, res) => {
  try {
    const { email } = req.params;
    const results = await getUserComplaint(email);
    res.json({ success: true, complaints: results });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching user complaints" });
  }
};

const assign = async (req, res) => {
  try {
    const id = req.params.id;
    const { assignedName, assignedContact } = req.body;

    if (!assignedName || !assignedContact) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and contact of personnel'
      });
    }

    const success = await assignPersonnel(id, assignedName, assignedContact);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Personnel not found"
      });
    }

    res.json({ success: true, message: "Personnel assigned successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to assign personnel" });
  }
};

const resolvedComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await markResolved(id);
    res.json({ success: true, message: "Complaint marked as resolved" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to resolve complaint" });
  }
};

const track = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and ticket code are required"
      });
    }

    const results = await trackTicket(email, code);
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    const { status, personnel_name, personnel_contact } = results[0];
    const response = { success: true, status };
    if (status === 'Assigned') {
      response.personnel = { name: personnel_name, contact: personnel_contact };
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

const complaintTypes = async (req, res) => {
  try {
    const results = await getComplaintTypes();
    res.json({ success: true, complaintTypes: results });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  submitComplaint,
  getAllComplaints,
  getUserComplaints,
  assign,
  resolvedComplaint,
  track,
  complaintTypes
};
