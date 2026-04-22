import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    avatar: String,
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    // { google: { id }, github: { id } }
    providers: {
      google: { id: String },
      github: { id: String },
    },
    isEmailVerified: { type: Boolean, default: false },
    refreshTokenHash: { type: String, select: false },
    otp: {
      code: { type: String, select: false },
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
    },
    magicToken: {
      hash: { type: String, select: false },
      expiresAt: Date,
    },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ 'providers.google.id': 1 }, { sparse: true });
userSchema.index({ 'providers.github.id': 1 }, { sparse: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function () {
  const maxAttempts = parseInt(process.env.ACCOUNT_LOCKOUT_ATTEMPTS || '5');
  const lockDuration = parseInt(process.env.ACCOUNT_LOCKOUT_DURATION_MINS || '15');

  this.loginAttempts += 1;

  if (this.loginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    this.loginAttempts = 0;
  }

  await this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    providers: Object.keys(this.providers || {}).filter((k) => this.providers[k]?.id),
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
