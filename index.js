const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const { Movie, User } = require("./models");
const auth = require("./auth");
const { check, validationResult } = require("express-validator");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// Authentication setup
auth(app);
require("./passport");

// Database connection
mongoose
  .connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database Connected to MongoDB - " + process.env.CONNECTION_URI))
  .catch((err) => console.error("Database Could not connect to MongoDB", err));

// Publicly accessible route for user registration with validation
app.post(
  "/users",
  [
    check("Username", "Username is required and must be at least 5 characters long").isLength({ min: 5 }),
    check("Username", "Username can only contain alphanumeric characters").isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email must be valid").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = User.hashPassword(req.body.Password);

    try {
      const existingUser = await User.findOne({ Username: req.body.Username });
      if (existingUser) {
        return res.status(400).send(req.body.Username + " already exists");
      }

      const newUser = await User.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

// PUT route to update user details with validation
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required and must be at least 5 characters long").isLength({ min: 5 }),
    check("Username", "Username can only contain alphanumeric characters").isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email must be valid").isEmail(),
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
      Birthday: req.body.Birthday,
    };

    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    await User.findOneAndUpdate({ Username: req.params.Username }, { $set: updateData }, { new: true })
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => res.status(500).send("Error: " + err));
  }
);

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to JAMES Movie API!");
});

// Get all movies (temporarily without authentication)
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).send("Error: " + error);
  }
});

// Get all users (JWT-protected)
app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by username (JWT-protected)
app.get("/users/:Username", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findOne({ Username: req.params.Username });
    res.json(user);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
});

// Get movie by title (JWT-protected)
app.get("/movies/title/:title", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const movie = await Movie.findOne({ Title: req.params.title });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user by ID (JWT-protected)
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

// Delete movie by ID (JWT-protected)
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
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});