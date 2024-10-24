const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Import the models from the models.js file
const { Movie, User } = require("./models");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB (replace 'cinemaDB' with your actual database name if different)
mongoose
  .connect("mongodb://localhost:27017/movie_api", {
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

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET movie by Title
app.get("/movies/title/:", async (req, res) => {
  try {
    const movie = await Movie.findOne({ title: req.params.title });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET movies by director
app.get("/movies/director/:directorName", async (req, res) => {
  try {
    const movies = await Movie.find({
      "director.name": req.params.directorName,
    });
    if (movies.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for this director" });
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET movies by genre
app.get("/movies/genre/:genreName", async (req, res) => {
  try {
    const movies = await Movie.find({ "genre.name": req.params.genreName });
    if (movies.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for this genre" });
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a New User
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Put, Update User
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
}); 

//Delete Users
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
app.listen(port, 0, 0, 0, 0, () => {
  console.log("Movie app is running on port " + port);
});