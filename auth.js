const jwtSecret = "your_jwt_secret";
const jwt = require("jsonwebtoken");
const passport = require("passport");

require("./passport"); // Correct file path

// Function to generate JWT
let generateJWToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // Use 'username' consistently
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

module.exports = (router) => {
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user) => {
      if (error || !user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      req.login(user, { session: false }, (error) => {
        if (error) return res.send(error);
            
        //  Generate Token 
        let token = generateJWToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};


