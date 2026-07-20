// controllers/expenseController.js
// Purpose: CRUD logic for expenses. Every function here assumes
// `protect` middleware has already run, so req.user is available.

const Expense = require('../models/Expense');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, description } = req.body;

    if (!title || amount === undefined) {
      res.status(400);
      throw new Error('Title and amount are required');
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      description,
      user: req.user._id, // ownership is tied to the logged-in user, never the client
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
// Supports optional query params: ?category=Food&from=2026-01-01&to=2026-01-31&page=1&limit=10
const getExpenses = async (req, res, next) => {
  try {
    const { category, from, to, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };

    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    // Ownership check: users must never be able to read another user's expense
    if (expense.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this expense');
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this expense');
    }

    const { title, amount, category, date, description } = req.body;

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;
    if (description !== undefined) expense.description = description;

    // .save() re-runs schema validation, unlike findByIdAndUpdate by default
    expense = await expense.save();

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    if (expense.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this expense');
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
