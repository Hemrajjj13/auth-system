import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

export const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// refresh tokens are stored as bcrypt hashes — raw token never persisted
export const hashToken = (token) => bcrypt.hash(token, 10);
export const compareTokenHash = (token, hash) => bcrypt.compare(token, hash);

export const signMagicToken = (email) =>
  jwt.sign({ email }, process.env.MAGIC_LINK_SECRET, {
    expiresIn: process.env.MAGIC_LINK_EXPIRES || '15m',
  });

export const verifyMagicToken = (token) =>
  jwt.verify(token, process.env.MAGIC_LINK_SECRET);

export const setRefreshCookie = (res, token) =>
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

export const clearRefreshCookie = (res) =>
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

export const generateOTP = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const hashOTP = (otp) => bcrypt.hash(otp, 10);
export const compareOTP = (otp, hash) => bcrypt.compare(otp, hash);
