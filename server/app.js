// server.js

const express = require('express');
const cors = require('cors');
const path = require("path");
require('dotenv').config();

const { createTable } = require('./config/createTable');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require("./routes/complaintRoutes");
const personnelRoutes = require("./routes/personnelRoutes");
const chatRoutes = require("./routes/chatRoutes");

const http = require("http");
const { connectSocket } = require("./socket");

const app = express();
const server = http.createServer(app);
connectSocket(server);

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create DB tables on server start
createTable()
  .then(() => {
    console.log('Table creation logic ran successfully');
  })
  .catch(error => {
    console.error('Error creating tables:', error);
  });

// Routes
app.use('/api', userRoutes);
app.use("/api", complaintRoutes);
app.use("/api/personnel", personnelRoutes);
app.use("/api/chat", chatRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: "Server is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
