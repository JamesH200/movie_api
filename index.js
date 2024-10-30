const express = require("express");
const mongoose = require("mongoose");

// Import the models from the models.js file
const { Movie, User } = require("./models");

// Initialize the Express app
const app = express();

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Connect to MongoDB 
mongoose
  .connect("mongodb://localhost:27017/mymovieapi", {      // changed database 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// GET All Movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // Make sure 'User' model is imported from your models.js
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a user by username
app.get('/users/:Username', async (req, res) => {
  console.log("Fetching user:", req.params.Username); // Check if the route is reached
  await User.findOne({ username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET movie by Title
app.get("/movies/title/:title", async (req, res) => {
  try {
    const movie = await Movie.findOne({ Title: req.params.title });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET movies by director
app.get("/movies/Director/:directorName", async (req, res) => {
  try {
    const movies = await Movie.find({
      "Director.Name": req.params.directorName // key has to match database
    });
    if (movies.length === 0) {
      return res.status(404).json({ message: "No movies found for this director" });
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET movies by genre
app.get("/movies/Genre/:genreName", async (req, res) => {
  try {
    const movies = await Movie.find({ "Genre.Name": req.params.genreName });
    if (movies.length === 0) {
      return res.status(404).json({ message: "No movies found for this genre" });
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a New User
app.post('/users', async (req, res) => {
  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username: req.body.username });
    
    if (existingUser) {
      return res.status(400).send(req.body.username + ' already exists');
    }
    
    // Create the new user if username doesn't exist
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday
    });
    
    res.status(201).json(newUser);
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// PUT, Update User
app.put('/users/:Username', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.Username },
      {
        $set: {
          username: req.body.Username,
          password: req.body.Password,
          email: req.body.Email,
          birthday: req.body.Birthday
        }
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// DELETE a User
app.delete("/users/:id", async (req, res) => {
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

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Movie app is running on port " + port);
});
