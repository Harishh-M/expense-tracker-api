// models/Expense.js
// Purpose: Defines the shape of an "Expense" document, and links it
// to the User who owns it via a reference (foreign-key-like relationship).

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Food',
          'Transport',
          'Shopping',
          'Bills',
          'Entertainment',
          'Health',
          'Education',
          'Other',
        ],
        message: '{VALUE} is not a supported category',
      },
      default: 'Other',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    // This is the "userId" field from the requirements. In Mongoose,
    // the idiomatic way to store a reference to another document is
    // via `ref` + ObjectId, which enables `.populate()` later if needed.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Index to make "get all expenses of a user, sorted by date" queries fast.
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
