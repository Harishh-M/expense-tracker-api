// config/db.js
// Purpose: Centralizes the MongoDB connection logic.
// Keeping this separate from server.js follows the "single responsibility"
// principle — server.js should only be responsible for starting the app.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure if DB connection fails.
    // There's no point running an API that can't reach its database.
    process.exit(1);
  }
};

module.exports = connectDB;
