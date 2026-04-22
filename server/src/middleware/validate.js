import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerRules = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

export const loginRules = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const emailRules = [
  body('email').trim().isEmail().normalizeEmail(),
];
