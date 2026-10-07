const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const teamRoutes = require('./routes/teamRoutes');
const clubRoutes = require('./routes/clubRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const bpclSeedRoutes = require('./routes/bpclSeedRoutes');
const inventiveRoutes = require('./routes/inventiveRoutes');
const contriveRoutes = require('./routes/contriveRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Load environment variables
dotenv.config({ path: __dirname + "/.env" });

const app = express();

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/team', teamRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory', bpclSeedRoutes);
app.use('/api/inventiveForm', inventiveRoutes);
app.use('/api/contriveForm', contriveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);


// Error handler middleware
app.use(errorHandler);


connectDB().then(async () => {
  try {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 6000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Error during server startup:", err);
    process.exit(1);
  }
}).catch(err => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});