import { Router } from 'express';
import passport from '../config/passport.js';
import {
  register, login, refresh, logout, getMe,
  oauthCallback,
  sendMagicLinkEmail, verifyMagicLinkToken,
  sendOTPCode, verifyOTPCode,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerRules, loginRules, emailRules, validate,
} from '../middleware/validate.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login',    authLimiter, loginRules,    validate, login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.get('/me',        protect, getMe);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  oauthCallback
);

router.get('/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=github_failed` }),
  oauthCallback
);

router.post('/magic-link/send',   authLimiter, emailRules, validate, sendMagicLinkEmail);
router.post('/magic-link/verify', verifyMagicLinkToken);

router.post('/otp/send',   authLimiter, emailRules, validate, sendOTPCode);
router.post('/otp/verify', verifyOTPCode);

export default router;
