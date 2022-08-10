const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Needed to use cookieParser


// Database object for storing urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Database object for storing user info
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// Generate a random string of 6 characters
function generateRandomString() {

  // Store all letters
  let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let resultString = "";

  // Loop six times and add a random letter to the result string
  for (let i = 1; i <= 6; i++) {

    // Return a random number between 0 and 61
    let index = Math.floor(Math.random() * 61) + 1;
    resultString += letters[index];
  }

  return resultString;
}


//---------- GET ROUTES ----------//

// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});


// URLs as JSON page
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// Hello page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// Registration page
app.get("/register", (req, res) => {

  // Render the register.ejs page
  res.render("register");
});


// URL Page with all URLs for the user
app.get("/urls", (req, res) => {

  // Store the username and the urlDatabase in templateVars
  // The entire database is stored so it can be displayed in the URLs page
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };

  // Render the /urls page by passing the data in templateVars
  res.render("urls_index", templateVars);
});


// New URL page
app.get("/urls/new", (req, res) => {

  // Store the username stored in cookies
  const templateVars = { 
    username: req.cookies["username"],
  };

  // Render the /urls/new page by passing the data in templateVars
  res.render("urls_new", templateVars);
});


// Page for editing shortened URL
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


// Shortened URL redirect page
app.get("/u/:id", (req, res) => {

  // Store the short URL ID in a variable
  const id = req.params.id;

  // Get the long URL from the database
  const longURL = urlDatabase[id];

  // Redirect to the long URL
  res.redirect(longURL);
});



//---------- POST ROUTES ----------//

// Deleting a shortened URL from the database
app.post("/urls/:id/delete", (req, res) => {

  // Store the id of a URL
  let id = req.params.id;

  // Delete the id and URL from the database
  delete urlDatabase[id];

  // Redirect to the urls page
  res.redirect('/urls');
});


// Adding a shortened URL to the database
app.post("/urls/:id", (req, res) => {

  // Store the id of a URL
  let id = req.params.id;

  // Set the longURL to the new longURL
  urlDatabase[id] = req.body.longURL;

  // Redirect to the page with the short URL
  res.redirect('/urls'); 
});


// URL page
app.post("/urls", (req, res) => {

  // Generate random string
  let id = generateRandomString();

  // Store the long URL in the database with a random string
  urlDatabase[id] = req.body.longURL;

  // Redirect to the page with the URL ID
  res.redirect(`/urls/${id}`); 
});


// Logging in
app.post("/login", (req, res) => {
  
  // Store the username from the text field
  let username = req.body.username;

  // Store the username in a cookie with the 'username' key
  res.cookie('username', username);

  // Print to the console
  console.log("Username stored in cookie: " + req.cookies.username);

  // Redirect to the URLs page
  res.redirect("/urls");
});


// Logging out
app.post("/logout", (req, res) => {

  // Clear the username cookie
  res.clearCookie('username');

  // Redirect to the URLs page
  res.redirect("/urls");
});


// Registering a new user
app.post("/register", (req, res) => {

  // Store the user's ID, email and password
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  // Add the user to the users database object
  users[userId] = { "id": userId, "email": email, "password": password};

  // Store the user info in a variable
  let user =  { "id": userId, "email": email, "password": password};

  // Store the user and email in cookies
  res.cookie("user_id", userId);
  res.cookie("email", email);

  // Print user to the console
  console.log("User stored in cookie: " + req.cookies.email)
  
  // Redirect to the URLs page
  res.redirect("/urls");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});