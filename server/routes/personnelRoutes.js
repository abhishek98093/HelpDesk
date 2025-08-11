const express = require("express");
const router = express.Router();
const {
  getPersonnels,
  getAvailablePersonnels,
  addPersonnels
} = require("../controllers/personnelController"); // Controllers will use PostgreSQL pool internally

// Routes
router.get("/", getPersonnels);
router.get("/available/:role", getAvailablePersonnels);
router.post("/", addPersonnels);

module.exports = router;
