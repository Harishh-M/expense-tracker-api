// routes/analyticsRoutes.js
// Purpose: Read-only analytics endpoints, all protected.

const express = require('express');
const router = express.Router();
const {
  getTotalExpense,
  getMonthlyExpense,
  getCategoryWiseExpense,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/total', getTotalExpense);        // GET /api/analytics/total
router.get('/monthly', getMonthlyExpense);     // GET /api/analytics/monthly?year=2026
router.get('/category', getCategoryWiseExpense); // GET /api/analytics/category

module.exports = router;
