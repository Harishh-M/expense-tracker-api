// controllers/analyticsController.js
// Purpose: Aggregation-based analytics over a user's expenses.
// Uses MongoDB's aggregation pipeline, which is the standard,
// performant way to compute sums/groupings at the database level
// instead of pulling all documents into Node and summing manually.

const mongoose = require('mongoose');
const Expense = require('../models/Expense');

// @desc    Get total amount spent by the logged-in user
// @route   GET /api/analytics/total
// @access  Private
const getTotalExpense = async (req, res, next) => {
  try {
    const result = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const total = result[0]?.total || 0;
    const count = result[0]?.count || 0;

    res.status(200).json({ success: true, data: { total, count } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get month-wise spending for the logged-in user (current year by default)
// @route   GET /api/analytics/monthly?year=2026
// @access  Private
const getMonthlyExpense = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year}-12-31T23:59:59.999Z`);

    const result = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          total: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, year, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise spending for the logged-in user
// @route   GET /api/analytics/category
// @access  Private
const getCategoryWiseExpense = async (req, res, next) => {
  try {
    const result = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTotalExpense, getMonthlyExpense, getCategoryWiseExpense };
