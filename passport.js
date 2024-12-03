const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const Users = require('./models').Users; // Assuming you have a Users model in models.js
const bcrypt = require('bcrypt');

// Local strategy for username and password login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username', // Field names from the login form
      passwordField: 'password',
    },
    (username, password, done) => {
      Users.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: 'Incorrect username' });
          }

          // Compare provided password with hashed password in DB
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return done(err);
            if (!isMatch) {
              return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
          });
        })
        .catch((err) => done(err));
    }
  )
);

// JWT strategy for token-based authentication
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // Extract JWT from the Authorization header
      secretOrKey: 'your_jwt_secret', // Replace with your JWT secret key
    },
    (jwtPayload, done) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        })
        .catch((err) => done(err));
    }
  )
);

module.exports = passport;

