const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Generate a random string of 6 characters
function generateRandomString() {

  // Store all letters
  let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  // Create string to hold random letters
  let randomString = "";

  // Loop 6 times
  for (let i = 1; i <= 6; i++) {

    // Return a random number between 0 and 61
    let index = Math.floor(Math.random() * 61) + 1;

    // Add the letter at the random index to the string
    randomString += letters[index];
  }

  return randomString;
}

// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {

  // Store the short URL ID in a variable
  let id = req.params.id;

  // Get the long URL from the database
  const longURL = urlDatabase[id];

  // Redirect to the long URL
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {

  // Store the id of a URL
  let id = req.params.id;

  // Delete the id and URL from the database
  delete urlDatabase[id];

  // Redirect to the urls page
  res.redirect('/urls');
});


app.post("/urls/:id", (req, res) => {

  // Store the id of a URL
  let id = req.params.id;

  // Set the longURL to the new longURL
  urlDatabase[id] = req.body.longURL;

  // Redirect to the page with the short URL
  res.redirect(`/urls/`); 
});


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  // Generate random string
  let id = generateRandomString();

  // Store the long URL in the database with a random string
  urlDatabase[id] = req.body.longURL;

  // Redirect to the page with the URL ID
  res.redirect(`/urls/${id}`); 
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});