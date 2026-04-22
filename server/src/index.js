import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import { initPassport } from './config/passport.js';
import passport from 'passport';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';


const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

initPassport();
app.use(passport.initialize());

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, _req, res, _next) => {
  console.error('[error]', err.message, { stack: err.stack });
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
