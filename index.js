const express = require("express");
const morgan = require("morgan");
const path = require("path");

const app = express();

// Use Morgan for logging
app.use(morgan("common"));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Movie data
const movies = [
  { title: "Prometheus", director: "Ridley Scott", genre: "Sci-Fi, Horror" },
  { title: "Blade Runner 2049", director: "Denis Villeneuve", genre: "Sci-Fi, Action" },
  { title: "Friday After Next", director: "Marcus Raboy", genre: "Comedy, Drama" },
  { title: "Inception", director: "Christopher Nolan", genre: "Sci-Fi, Action" },
  { title: "The Big Short", director: "Adam McKay", genre: "Comedy, Thriller" },
  { title: "Oblivion", director: "Joseph Kosinski", genre: "Action, Sci-Fi" },
  { title: "Django Unchained", director: "Quentin Tarantino", genre: "Western, Action" },
  { title: "The Wolf On Wall Street", director: "Martin Scorsese", genre: "Comedy, Thriller" },
  { title: "Edge of Tomorrow", director: "Doug Liman", genre: "Action, Sci-Fi" },
  { title: "The Fast and The Furious", director: "Rob Cohen", genre: "Action, Crime" },
];

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to my Top 10 Movies!");
});

app.get("/documentation", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "documentation.html"));
});

app.get("/movies", (req, res) => {
  res.json(movies);
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
