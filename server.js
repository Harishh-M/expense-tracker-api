// server.js
// Purpose: The entry point of the application. Its ONLY jobs are:
//   1. Load environment variables
//   2. Connect to the database
//   3. Configure global middleware
//   4. Mount routers
//   5. Start listening for requests
// No business logic should ever live here.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// 1. Connect to MongoDB Atlas
connectDB();

const app = express();

// 2. Global middleware
app.use(cors());          // allows cross-origin requests (e.g. from a frontend app)
app.use(express.json());  // parses incoming JSON request bodies into req.body

// Simple health check route — useful to confirm the server is alive
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Expense Tracker API is running' });
});

// 3. Mount routers under their base paths
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// 4. Error handling middleware — MUST be registered last
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
