# SecureAuth

MERN · Vite · Tailwind v4 · ES Modules · No auth library hiding the logic.

6 auth methods built from scratch — every mechanism visible, explained, and intentional.

---

## Auth Methods

| Method | Details |
|---|---|
| Email + Password | bcrypt 12-round hash, account lockout after N failed attempts |
| Google OAuth 2.0 | Passport.js, same-email provider merging |
| GitHub OAuth 2.0 | Scope: `user:email`, upsert logic |
| Magic Link | Signed JWT, sent via email, 15-min expiry, one-time use |
| OTP | 6-digit code, bcrypt-stored, 10-min expiry, max 3 attempts |
| RBAC | `user → moderator → admin` roles, `authorize()` middleware |

---

## Project Structure

```
auth-system/
├── server/
│   └── src/
│       ├── config/
│       │   ├── db.js                  # Mongoose connection
│       │   └── passport.js            # Google + GitHub strategies, provider merging
│       ├── controllers/
│       │   └── authController.js      # All 6 auth flows
│       ├── middleware/
│       │   ├── auth.js                # protect + authorize(roles) RBAC
│       │   ├── rateLimiter.js         # express-rate-limit per-route
│       │   └── validate.js            # express-validator rules
│       ├── models/
│       │   └── User.js                # Schema: bcrypt hook, lockout, OTP, magic, RBAC
│       ├── routes/
│       │   ├── auth.js                # All auth routes
│       │   └── protected.js           # RBAC-gated demo routes
│       ├── services/
│       │   └── email.js               # Nodemailer — magic link + OTP emails
│       ├── utils/
│       │   └── token.js               # JWT sign/verify, hash/compare, cookie helpers
│       └── index.js                   # Express app entry point
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   └── OAuthButtons.jsx   # Google + GitHub sign-in buttons
│       │   ├── layout/
│       │   │   ├── BrandPanel.jsx     # Left auth panel
│       │   │   └── RouteGuards.jsx    # ProtectedRoute + PublicRoute
│       │   └── ui/
│       │       ├── InputField.jsx     # Input with eye-toggle + error state
│       │       ├── OTPInput.jsx       # 6-box input, auto-focus + paste support
│       │       └── PasswordStrength.jsx
│       ├── context/
│       │   └── AuthContext.jsx        # useReducer global state, all auth actions
│       ├── lib/
│       │   └── api.js                 # Axios instance + silent refresh interceptor
│       ├── pages/
│       │   ├── LoginPage.jsx          # Tabs: Password / Magic Link / OTP
│       │   ├── RegisterPage.jsx       # Register + OAuth
│       │   ├── Dashboard.jsx          # Protected — API reference + security info
│       │   ├── OAuthCallback.jsx      # Reads token from URL hash after OAuth
│       │   └── MagicVerify.jsx        # Verifies magic link token from URL
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css                  # Tailwind v4 @theme + custom classes
│
├── package.json                       # Root scripts via concurrently
└── README.md
```

---

## Prerequisites

- Node.js v20+
- MongoDB Atlas (free tier)
- Gmail App Password — for magic link + OTP emails
- AWS account — for deployment

---

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/auth-system.git
cd auth-system
npm run install:all

# 2. Configure environment
cp server/.env.example server/.env
# Fill in all values — see Environment Variables section below

# 3. Run both servers
npm run dev
```

- API → `http://localhost:5000`
- Client → `http://localhost:5173`

---

## Environment Variables

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/auth_system

# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# https://console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# https://github.com/settings/developers → New OAuth App
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Gmail: Settings → Security → App Passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="SecureAuth <noreply@secureauth.dev>"

MAGIC_LINK_SECRET=
MAGIC_LINK_EXPIRES=15m

ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION_MINS=15
```

OAuth keys are optional for local dev — password, magic link, and OTP all work without them.

---

## API Reference

### Auth routes — `/api/auth`

| Method | Route | Body | Auth |
|--------|-------|------|------|
| POST | `/register` | `{ name, email, password }` | — |
| POST | `/login` | `{ email, password }` | — |
| POST | `/refresh` | — | HttpOnly cookie |
| POST | `/logout` | — | — |
| GET | `/me` | — | Bearer token |
| GET | `/google` | — | — |
| GET | `/google/callback` | — | — |
| GET | `/github` | — | — |
| GET | `/github/callback` | — | — |
| POST | `/magic-link/send` | `{ email }` | — |
| POST | `/magic-link/verify` | `{ token }` | — |
| POST | `/otp/send` | `{ email }` | — |
| POST | `/otp/verify` | `{ email, otp }` | — |

### Protected routes — `/api/protected`

| Method | Route | Required Role |
|--------|-------|---------------|
| GET | `/profile` | any authenticated user |
| GET | `/users` | moderator, admin |
| PATCH | `/users/:id/role` | admin only |

---

## How Each Flow Works

### JWT + Refresh Token Rotation

```
Login
  → access token  (15 min · stored in sessionStorage)
  → refresh token (7 days · stored in HttpOnly cookie · hashed in DB)

Access token expires
  → Axios interceptor fires silently
  → POST /auth/refresh (cookie sent automatically)
  → Old token hash verified → new pair issued → old hash invalidated
  → Original request retried transparently
```

Storing the refresh token hashed means a database breach can't be used to impersonate users — the hash is useless without the original token.

### OAuth Provider Merging

```
Google login (email: a@b.com)  →  no existing user  →  create account

GitHub login (email: a@b.com)  →  no GitHub user found
                                →  email a@b.com exists (from Google)
                                →  merge: add github.id to providers map
                                →  one account, two providers
```

### Magic Link

```
POST /magic-link/send
  → sign JWT with email payload (15 min)
  → hash token → store in user.magicToken
  → email link to user

User clicks link → POST /magic-link/verify
  → verify JWT signature + expiry
  → compare token against stored hash
  → consume token (one-time use)
  → issue session tokens
```

### OTP

```
POST /otp/send
  → generate 6-digit code
  → bcrypt hash → store with 10-min expiry + attempts: 0
  → email plain code

POST /otp/verify
  → check expiry
  → check attempts < 3
  → compare against hash
  → consume OTP → issue session tokens
```

### RBAC

```js
// Protect a route for admins only
router.delete('/users/:id', protect, authorize('admin'), handler);

// Allow moderators and admins
router.get('/users', protect, authorize('admin', 'moderator'), handler);
```

---

## Security Checklist

- [x] bcrypt 12 rounds — slow enough to defeat brute-force
- [x] Refresh tokens stored hashed — DB breach can't produce valid tokens
- [x] Token rotation — reuse of a refresh token triggers full session wipe
- [x] HttpOnly cookie — XSS cannot read the refresh token
- [x] sessionStorage for access token — cleared on tab close
- [x] Account lockout — 5 failed logins → timed block
- [x] Rate limiting — 10 req/15min on all auth routes
- [x] Helmet.js — HTTP security headers
- [x] express-mongo-sanitize — blocks NoSQL injection
- [x] Generic error messages — no user enumeration
- [x] `select: false` on sensitive fields — never leaked in queries
- [x] SameSite=Strict cookie — CSRF protection
- [x] express-validator on all POST bodies

---

## Deployment (AWS Free Tier)

```
Browser
  ├──► CloudFront → S3              (React build — frontend)
  └──► EC2 t2.micro → Express       (API — backend)
                  └──► MongoDB Atlas (database)
```

### Backend — EC2

```bash
# On your EC2 instance (Ubuntu 24.04, t2.micro, Mumbai ap-south-1)
git clone https://github.com/YOUR_USERNAME/auth-system.git
cd auth-system/server
npm install
cp .env.example .env && nano .env   # fill in production values

# Start with PM2
pm2 start src/index.js --name auth-api
pm2 startup && pm2 save
```

Nginx config (`/etc/nginx/sites-available/auth-api`):
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Frontend — S3 + CloudFront

```bash
# Build
VITE_API_URL=http://YOUR_EC2_IP npm run build --prefix client

# Upload to S3
aws s3 sync client/dist/ s3://YOUR_BUCKET_NAME --delete
```

S3: enable static website hosting, set `index.html` as both index and error document.

CloudFront: create distribution pointing to S3, add custom error responses for 403/404 → `/index.html` → 200 (required for React Router).

### Production environment changes

```dotenv
NODE_ENV=production
CLIENT_URL=https://YOUR_CLOUDFRONT_URL
GOOGLE_CALLBACK_URL=http://YOUR_EC2_IP/api/auth/google/callback
GITHUB_CALLBACK_URL=http://YOUR_EC2_IP/api/auth/github/callback
```

### Useful commands

```bash
pm2 status                          # check running processes
pm2 logs auth-api                   # live logs
pm2 restart auth-api                # restart after .env change
git pull && npm install && pm2 restart auth-api   # deploy update
```

---

## What to Add Next

| Feature | Approach |
|---|---|
| Email verification on register | Token → link → `GET /auth/verify-email?token=` |
| Password reset | Time-limited token via email |
| 2FA / TOTP | `otplib` + QR code → bind to authenticator app |
| Refresh token blocklist | Redis SET with TTL → instant revocation |
| Active sessions UI | List devices → revoke individual sessions |
| Audit log | Write auth events to a separate collection |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind v4, React Router v6, Axios |
| Backend | Node.js, Express 4, ES Modules |
| Database | MongoDB, Mongoose |
| Auth | jsonwebtoken, bcryptjs, Passport.js |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, express-validator |
| Hosting | AWS EC2 + S3 + CloudFront |

---

## License

MIT