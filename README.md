# SecureAuth

MERN stack authentication system with 6 auth methods built from scratch. No third-party auth library — every mechanism is implemented directly.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind v4, React Router v6, Axios |
| Backend | Node.js, Express 4, ES Modules |
| Database | MongoDB, Mongoose |
| Auth | jsonwebtoken, bcryptjs, Passport.js |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, express-validator |

## Auth Methods

| Method | Implementation |
|---|---|
| Email + Password | bcrypt 12-round hash, account lockout after failed attempts |
| Google OAuth 2.0 | Passport.js, same-email provider merging |
| GitHub OAuth 2.0 | scope: `user:email`, upsert logic |
| Magic Link | Signed JWT, 15-min expiry, one-time use |
| OTP | 6-digit code, bcrypt-stored, 10-min expiry, 3 attempt limit |
| RBAC | `user / moderator / admin` roles, `authorize()` middleware |

## Project Structure

```
auth-system/
├── server/
│   └── src/
│       ├── config/
│       │   ├── db.js              # Mongoose connection
│       │   └── passport.js        # Google + GitHub strategies, provider merging
│       ├── controllers/
│       │   └── authController.js  # All 6 auth flows
│       ├── middleware/
│       │   ├── auth.js            # protect + authorize(roles)
│       │   ├── rateLimiter.js     # per-route rate limiting
│       │   └── validate.js        # express-validator rules
│       ├── models/
│       │   └── User.js            # Schema with bcrypt hook, lockout, OTP, RBAC
│       ├── routes/
│       │   ├── auth.js            # All auth routes
│       │   └── protected.js       # RBAC-gated routes
│       ├── services/
│       │   └── email.js           # Magic link + OTP emails
│       ├── utils/
│       │   └── token.js           # JWT sign/verify, cookie helpers
│       └── index.js
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   └── OAuthButtons.jsx
│       │   ├── layout/
│       │   │   ├── BrandPanel.jsx
│       │   │   └── RouteGuards.jsx
│       │   └── ui/
│       │       ├── InputField.jsx
│       │       ├── OTPInput.jsx
│       │       └── PasswordStrength.jsx
│       ├── context/
│       │   └── AuthContext.jsx    # useReducer global auth state
│       ├── lib/
│       │   └── api.js             # Axios + silent token refresh interceptor
│       ├── pages/
│       │   ├── LoginPage.jsx      # Password / Magic Link / OTP tabs
│       │   ├── RegisterPage.jsx
│       │   ├── Dashboard.jsx
│       │   ├── OAuthCallback.jsx
│       │   └── MagicVerify.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── package.json
```

## Setup

**Requirements:** Node.js v20+, MongoDB Atlas account, Gmail App Password

```bash
# Install dependencies
npm run install:all

# Configure environment
cp server/.env.example server/.env

# Run
npm run dev
```

API runs on `http://localhost:5000`, client on `http://localhost:5173`.

## Environment Variables

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/auth_system

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

MAGIC_LINK_SECRET=
MAGIC_LINK_EXPIRES=15m

ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION_MINS=15
```

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

OAuth credentials are optional — password, magic link, and OTP work without them.

## API Reference

### `/api/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Email + password login |
| POST | `/refresh` | Cookie | Rotate refresh token |
| POST | `/logout` | — | Clear session |
| GET | `/me` | Bearer | Current user |
| GET | `/google` | — | Initiate Google OAuth |
| GET | `/google/callback` | — | Google OAuth callback |
| GET | `/github` | — | Initiate GitHub OAuth |
| GET | `/github/callback` | — | GitHub OAuth callback |
| POST | `/magic-link/send` | — | Send magic link email |
| POST | `/magic-link/verify` | — | Verify magic link token |
| POST | `/otp/send` | — | Send OTP code |
| POST | `/otp/verify` | — | Verify OTP code |

### `/api/protected`

| Method | Route | Required Role |
|--------|-------|---------------|
| GET | `/profile` | any |
| GET | `/users` | moderator, admin |
| PATCH | `/users/:id/role` | admin |

## Security

- Refresh tokens stored as bcrypt hashes — raw token never persisted
- Token rotation on every refresh — reuse triggers session wipe
- Access token in `sessionStorage`, refresh token in `HttpOnly` cookie
- Account lockout after configurable failed login attempts
- Rate limiting on all auth routes
- `select: false` on all sensitive schema fields
- NoSQL injection prevention via `express-mongo-sanitize`
- Generic error messages — no field-level leaking

## License

MIT