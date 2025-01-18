const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const { Movie, User } = require("./models");
const auth = require("./auth");
const { check, validationResult, body } = require("express-validator");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());
auth(app); // Load authentication setup
require("./passport"); // Initialize passport configuration

mongoose
  .connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database Connected to MongoDB - " +process.env.CONNECTION_URI)) //added + process.env.CONNECTION_URI

  .catch((err) => console.error("Database Could not connect to MongoDB", err));

  // Publicly accessible route for user registration with validation 
app.post(
  '/users',
  [
    // Validation rules
    check('Username', 'Username is required and must be at least 5 characters long').isLength({ min: 5 }),
    check('Username', 'Username can only contain alphanumeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email must be valid').isEmail()
  ],
  async (req, res) => {
    // Check validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = User.hashPassword(req.body.Password);

    try {
      // Check if user with this username already exists
      const existingUser = await User.findOne({ Username: req.body.Username });
      if (existingUser) {
        return res.status(400).send(req.body.Username + ' already exists');
      }

      // Create and save new user
      const newUser = await User.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  }
);


// check("Username").optional().isLength({ min: 5 }).withMessage("Username must be at least 5 characters long."),
  // check("Password").optional().notEmpty().withMessage("Password is required if provided."),
   //("Email").optional().isEmail().withMessage("Invalid email address."),
   //req.body("Birthday").optional().isDate().withMessage("Invalid date format for Birthday.")

// PUT route to update user details with validation
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check('Username', 'Username is required and must be at least 5 characters long').isLength({ min: 5 }),
    check('Username', 'Username can only contain alphanumeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email must be valid').isEmail()
  ],
  async (req, res) => {
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = {
      Username: req.body.Username,
      Password: req.body.Password ? User.hashPassword(req.body.Password) : undefined,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    };

    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    await User.findOneAndUpdate({ Username: req.params.Username }, { $set: updateData }, { new: true })
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

app.get('/', (req, res) => {
  res.send('Welcome to JAMES Movie API!');
});

// JWT-protected routes
app.get("/movies",(req, res) => { // temporaily remove authentication....this goes in between movies and req res.....passport.authenticate("jwt", { session: false }), async 

  try {
    const movies = Movie.find(); // remove await because its only allowed with async ... example const movies = awaait Movie.find ();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});

app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users/:Username", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ Username: req.params.Username });
    res.json(user);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

app.get("/movies/title/:title", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const movie = await Movie.findOne({ Title: req.params.title });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a User by ID with JWT
app.delete("/users/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a Movie by ID with JWT
app.delete("/movies/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});