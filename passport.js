const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

const Users = Models.User; // Ensure this matches the export in models.js
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt; // Fix ExtractJWT typo

passport.use(
  new LocalStrategy(
    {
      usernameField: "Username", // Ensure field name matches in models
      passwordField: "Password", 
    },
    async (username, password, done) => {
      await Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Incorrect username or password." });
          }
          console.log("Authentication successful");
          return done(null, user);
        })
        .catch((error) => done(error));
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    async (jwtPayload, done) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => done(null, user))
        .catch((error) => done(error));
    }
  )
);