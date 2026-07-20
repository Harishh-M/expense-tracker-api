// models/User.js
// Purpose: Defines the shape of a "User" document in MongoDB and
// attaches behavior (password hashing, password comparison) to it.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // never return password field by default in queries
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Mongoose "pre-save hook": runs automatically right before a document
// is saved to the database. This is where we hash the plain-text password.
userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or has been changed.
  // Without this check, updating unrelated fields (like name) would
  // re-hash an already-hashed password and break login.
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: lets us call user.matchPassword('plaintext')
// anywhere we have a user document, instead of repeating bcrypt logic.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
