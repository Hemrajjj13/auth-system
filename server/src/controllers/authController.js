import User from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  compareTokenHash,
  setRefreshCookie,
  clearRefreshCookie,
  signMagicToken,
  verifyMagicToken,
  generateOTP,
  hashOTP,
  compareOTP,
} from '../utils/token.js';
import { sendMagicLink, sendOTP } from '../services/email.js';

const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokenHash = await hashToken(refreshToken);
  await user.save();
  setRefreshCookie(res, refreshToken);
  return accessToken;
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const accessToken = await issueTokens(user, res);

    res.status(201).json({ accessToken, user: user.toPublic() });
  } catch (err) {
    console.error('[auth] register failed:', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokenHash +loginAttempts +lockUntil');

    if (user?.isLocked()) {
      return res.status(423).json({
        message: `Account locked. Try again after ${new Date(user.lockUntil).toLocaleTimeString()}`,
      });
    }

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      await user.incrementLoginAttempts();
      const remaining = parseInt(process.env.ACCOUNT_LOCKOUT_ATTEMPTS || '5') - user.loginAttempts;
      return res.status(401).json({
        message: remaining > 0
          ? `Invalid email or password (${remaining} attempts left)`
          : 'Account locked due to too many failed attempts',
      });
    }

    await user.resetLoginAttempts();
    const accessToken = await issueTokens(user, res);

    res.json({ accessToken, user: user.toPublic() });
  } catch (err) {
    console.error('[auth] login failed:', err.message);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokenHash');

    if (!user || !user.refreshTokenHash) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const isValid = await compareTokenHash(token, user.refreshTokenHash);
    if (!isValid) {
      // potential theft — invalidate all sessions for this user
      user.refreshTokenHash = null;
      await user.save();
      clearRefreshCookie(res);
      return res.status(401).json({ message: 'Token reuse detected — session terminated' });
    }

    const accessToken = await issueTokens(user, res);
    res.json({ accessToken, user: user.toPublic() });
  } catch (err) {
    clearRefreshCookie(res);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
      } catch {
        // expired or invalid token — still clear the cookie
      }
    }
  } finally {
    clearRefreshCookie(res);
    res.json({ message: 'Logged out' });
  }
};

export const getMe = (req, res) => res.json({ user: req.user.toPublic() });

export const oauthCallback = async (req, res) => {
  try {
    const accessToken = await issueTokens(req.user, res);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback#token=${accessToken}`);
  } catch {
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

export const sendMagicLinkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: email.split('@')[0], email, isEmailVerified: true });
    }

    const magicToken = signMagicToken(email);
    user.magicToken = {
      hash: await hashToken(magicToken),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
    await user.save();

    await sendMagicLink(email, magicToken);
    res.json({ message: 'Magic link sent' });
  } catch (err) {
    console.error('[auth] magic-link send failed:', err.message);
    res.status(500).json({ message: 'Failed to send magic link' });
  }
};

export const verifyMagicLinkToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const decoded = verifyMagicToken(token);
    const user = await User.findOne({ email: decoded.email }).select('+magicToken');

    if (!user?.magicToken?.hash || user.magicToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Magic link expired or already used' });
    }

    const isValid = await compareTokenHash(token, user.magicToken.hash);
    if (!isValid) return res.status(400).json({ message: 'Invalid magic link' });

    user.magicToken = { hash: null, expiresAt: null };
    user.isEmailVerified = true;
    const accessToken = await issueTokens(user, res);

    res.json({ accessToken, user: user.toPublic() });
  } catch {
    res.status(400).json({ message: 'Invalid or expired magic link' });
  }
};

export const sendOTPCode = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: email.split('@')[0], email, isEmailVerified: true });
    }

    const otp = generateOTP();
    user.otp = {
      code: await hashOTP(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    };
    await user.save();

    await sendOTP(email, otp);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('[auth] otp send failed:', err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp');
    if (!user?.otp?.code) {
      return res.status(400).json({ message: 'No active OTP for this email' });
    }

    if (user.otp.expiresAt < new Date()) {
      user.otp = {};
      await user.save();
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (user.otp.attempts >= 3) {
      user.otp = {};
      await user.save();
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    const isValid = await compareOTP(otp, user.otp.code);
    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();
      const remaining = 3 - user.otp.attempts;
      return res.status(400).json({
        message: `Invalid OTP — ${remaining} attempt${remaining === 1 ? '' : 's'} remaining`,
      });
    }

    user.otp = {};
    user.isEmailVerified = true;
    const accessToken = await issueTokens(user, res);

    res.json({ accessToken, user: user.toPublic() });
  } catch (err) {
    console.error('[auth] otp verify failed:', err.message);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};
