const express = require("express");
const morgan = require("morgan");
const path = require("path");
const app = express();

// Use Morgan for logging
app.use(morgan("common"));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Movie data with descriptions, genres, and directors for all movies
const movies = [
  {
    title: "Prometheus",
    description:
      "A team of explorers discover a clue to the origins of mankind on Earth, leading them to an alien world.",
    director: "Ridley Scott",
    genre: "Sci-Fi, Horror",
    featured: false,
  },
  {
    title: "Blade Runner 2049",
    description:
      "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.",
    director: "Denis Villeneuve",
    genre: "Sci-Fi, Action",
    featured: true,
  },
  {
    title: "Friday After Next",
    description:
      "Cousins Craig and Day-Day must deal with a ghetto Santa Claus who breaks into their apartment and steals their presents.",
    director: "Marcus Raboy",
    genre: "Comedy, Drama",
    featured: false,
  },
  {
    title: "Inception",
    description:
      "A thief who enters the dreams of others in order to steal information is tasked with planting an idea in a target's subconscious.",
    director: "Christopher Nolan",
    genre: "Sci-Fi, Action",
    featured: true,
  },
  {
    title: "The Big Short",
    description:
      "A group of investors predict the credit and housing bubble collapse of the mid-2000s and decide to profit from it.",
    director: "Adam McKay",
    genre: "Comedy, Thriller",
    featured: false,
  },
  {
    title: "Oblivion",
    description:
      "A veteran assigned to extract Earth's remaining resources begins to question what he knows about his mission and himself.",
    director: "Joseph Kosinski",
    genre: "Action, Sci-Fi",
    featured: false,
  },
  {
    title: "Django Unchained",
    description:
      "With the help of a German bounty-hunter, a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.",
    director: "Quentin Tarantino",
    genre: "Western, Action",
    featured: true,
  },
  {
    title: "The Wolf On Wall Street",
    description:
      "Based on the true story of Jordan Belfort, a stockbroker rises to wealth and excess in the 1990s.",
    director: "Martin Scorsese",
    genre: "Comedy, Thriller",
    featured: true,
  },
  {
    title: "Edge of Tomorrow",
    description:
      "A soldier caught in a time loop relives his last day in a brutal alien war and becomes better with each iteration.",
    director: "Doug Liman",
    genre: "Action, Sci-Fi",
    featured: false,
  },
  {
    title: "The Fast and The Furious",
    description:
      "Los Angeles police officer Brian O'Conner must decide where his loyalty lies when he becomes enamored with the street racing world.",
    director: "Rob Cohen",
    genre: "Action, Crime",
  },
];

// Gets the list of data about ALL Movies

// GET all movies
app.get("/movies", (req, res) => {
  res.json(topMovies);
});

// GET data about a single movie by title
app.get("/movies/:title", (req, res) => {
  const movie = topMovies.find((movie) => movie.title === req.params.title);

  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send("Sorry! Movie not found!");
  }
});

// POST a new movie
app.post("/movies", (req, res) => {
  const newMovie = {
    id: uuidv4(),
    title: req.body.title,
    director: req.body.director,
    genre: req.body.genre,
    imageUrl: req.body.imageUrl,
  };

  if (!newMovie.title || !newMovie.director) {
    res.status(400).send("Opps! Missing required fields: title or director");
  } else {
    topMovies.push(newMovie);
    res.status(201).json(newMovie);
  }
});

// DELETE a movie by title
app.delete("/movies/:title", (req, res) => {
  const movieIndex = topMovies.findIndex(
    (movie) => movie.title === req.params.title
  );

  if (movieIndex !== -1) {
    topMovies.splice(movieIndex, 1);
    res.status(200).send(`Movie titled "${req.params.title}" was deleted.`);
  } else {
    res.status(404).send("Oops! Movie not found!");
  }
});

// (Update) the genre of a movie by title
app.put("/movies/:title/:genre", (req, res) => {
  const movie = topMovies.find((movie) => movie.title === req.params.title);

  if (movie) {
    movie.genre = req.body.genre;
    res.status(200).json(movie);
  } else {
    res.status(404).send("sorry! Movie not found!");
  }
});

// PUT (Update) the director of a movie by title
app.put("/movies/:title/director", (req, res) => {
  const movie = topMovies.find((movie) => movie.title === req.params.title);

  if (movie) {
    movie.director = req.body.director;
    res.status(200).json(movie);
  } else {
    res.status(404).send("Movie not found");
  }
});


// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the terminal
  res.status(500).send("Something broke!"); // Send a generic error response to the client
});

// Listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
