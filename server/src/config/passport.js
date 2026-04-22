import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Upsert logic shared across providers:
// 1. match by provider id  2. match by email (merge)  3. create new
const upsertOAuthUser = async ({ provider, providerId, email, name, avatar }) => {
  const byProvider = await User.findOne({ [`providers.${provider}.id`]: providerId });
  if (byProvider) return byProvider;

  if (email) {
    const byEmail = await User.findOne({ email });
    if (byEmail) {
      byEmail.providers[provider] = { id: providerId };
      if (!byEmail.avatar && avatar) byEmail.avatar = avatar;
      await byEmail.save();
      return byEmail;
    }
  }

  return User.create({
    name,
    email,
    avatar,
    isEmailVerified: true,
    providers: { [provider]: { id: providerId } },
  });
};

export const initPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await upsertOAuthUser({
            provider: 'google',
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.find((e) => e.primary)?.value ||
            profile.emails?.[0]?.value;
          const user = await upsertOAuthUser({
            provider: 'github',
            providerId: String(profile.id),
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // stateless JWT auth — serialize/deserialize are required stubs only
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, await User.findById(id));
    } catch (err) {
      done(err);
    }
  });
};

export default passport;
