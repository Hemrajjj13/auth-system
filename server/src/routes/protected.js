import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// All routes in here require authentication
router.use(protect);

router.get('/profile', (req, res) => {
  res.json({ user: req.user.toPublic() });
});

router.get('/users', authorize('admin', 'moderator'), async (req, res) => {
  const users = await User.find().select('-password -refreshTokenHash -otp -magicToken');
  res.json({ users: users.map((u) => u.toPublic()) });
});

router.patch('/users/:id/role', authorize('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: user.toPublic() });
});

export default router;
