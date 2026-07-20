// routes/expenseRoutes.js
// Purpose: All expense-related endpoints. Every route here is
// protected — you must be logged in to manage expenses.

const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// Apply `protect` to every route defined after this line, on this router
router.use(protect);

router.route('/')
  .post(addExpense)     // POST   /api/expenses
  .get(getExpenses);    // GET    /api/expenses

router.route('/:id')
  .get(getExpenseById)  // GET    /api/expenses/:id
  .put(updateExpense)   // PUT    /api/expenses/:id
  .delete(deleteExpense); // DELETE /api/expenses/:id

module.exports = router;
