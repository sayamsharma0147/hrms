/*
  GOOGLE OAUTH SETUP:
  1. Go to https://console.cloud.google.com
  2. Create a new project
  3. Enable Google+ API
  4. Go to Credentials -> Create OAuth 2.0 Client ID
  5. Authorized redirect URIs: http://localhost:5000/api/auth/google/callback
  6. Copy Client ID and Secret to .env
*/
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const crypto = require('crypto');
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error('Google account email is unavailable'));
        }

        let user = await User.findOne({ email });
        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName,
          email,
          password: crypto.randomUUID(),
          role: 'Interviewer',
          googleId: profile.id,
          isActive: true,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
