require("dotenv").config(); // Load .env variables
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');

// Dummy in-memory user storage (you can wire MongoDB here)
const users = new Map();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.get(id);
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      users.set(profile.id, profile); // Store user
      return done(null, profile);
    }
  )
);
