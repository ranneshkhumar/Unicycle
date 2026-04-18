const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    university: { type: String, default: '' },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    //added for email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);