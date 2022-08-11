const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Needed to use cookieParser


// Database object for storing urls
const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": { 
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
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


//---------- HELPER FUNCTIONS -----------//

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


// Return an user in the database given an email
function getUserByEmail(email) {

  // Iterate through the database
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }

  return null;
}


// Returns true if an email is taken
function isEmailTaken(email) {

  // Iterate through the database
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }

  return false;
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

  // Get the user id from cookies
  let userId = req.cookies["user_id"];

  // If the user is logged in, redirect to the URL page
  if (userId !== undefined) {
    res.redirect('/urls');

  // If the user is not logged in, render the register.ejs page
  } else {
    res.render("register");
  }
});


// Login page
app.get("/login", (req, res) => {

  // Get the user id from cookies
  let userId = req.cookies["user_id"];

  // If the user is logged in, redirect to the URL page
  if (userId !== undefined) {
    res.redirect('/urls');

  // If the user is not logged in, render the login.ejs page
  } else {
    res.render("login");
  }
});


// URL Page with all URLs for the user
app.get("/urls", (req, res) => {

  // Get the user id from cookies
  let userId = req.cookies["user_id"];

  // If the user is logged in, render the url page
  if (userId !== undefined) {

    // Get the user info from the users database
    let user = users[userId];

    // Store the user and the urlDatabase in templateVars
    // The entire url database is stored so it can be displayed in the URLs page
    const templateVars = { 
      user: user,
      urls: urlDatabase 
    };

    // Render the /urls page by passing the data in templateVars
    res.render("urls_index", templateVars);

  // If the user is not logged in, send a 403 status code
  } else {
    res.status(403).send('Must be logged in to view URLs');
  }

});


// New URL page
app.get("/urls/new", (req, res) => {

  // Get the user id from cookies
  let userId = req.cookies["user_id"];

  // If the user is logged in, render the new url page
  if (userId !== undefined) {
    
    // Get the user info from the users database
    let user = users[userId];

    // Store the user in templateVars
    const templateVars = { 
      user: user
    };

    // Render the /urls/new page by passing the data in templateVars
    res.render("urls_new", templateVars);

  // If the user is not logged in, redirect to the login page
  } else {
    res.redirect('/login');
  }
});


// Page for editing shortened URL
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});


// Shortened URL redirect page
app.get("/u/:id", (req, res) => {

  // Store the shortened URL ID in a variable
  const id = req.params.id;

  // If the shortened URL ID exists is in the database
  if (urlDatabase[id] !== undefined) {

    // Get the long URL from the database
    const longURL = urlDatabase[id].longURL;

    // Redirect to the long URL
    res.redirect(longURL);

  // If the URL ID doesn't exist, send a 400 status code
  } else {
    res.status(400).send('URL does not exist');
  }
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

  // Get the user id from cookies
  let userId = req.cookies["user_id"];
  
  // Store the id of a URL
  let id = req.params.id;

  // Set the longURL to the new longURL
  urlDatabase[id] = {"userID": userId, "longURL": req.body.longURL};

  // Redirect to the page with the short URL
  res.redirect('/urls'); 
});


// URL page
app.post("/urls", (req, res) => {

  // Get the user id from cookies
  let userId = req.cookies["user_id"];

  // If the user is logged in, shorten the URL
  if (userId !== undefined) {
    
      // Generate random string
    let id = generateRandomString();

    // Store the long URL in the database with a random string
    urlDatabase[id] = {"userID": userId, "longURL": req.body.longURL};

    // Redirect to the page with the URL ID
    res.redirect(`/urls/${id}`); 

  // If the user is not logged in, send a 403 status code
  } else {
    res.status(403).send('Must be logged in to shorten URLs');
  }
});


// Logging in
app.post("/login", (req, res) => {
  
  // Store the email and password from the input form
  email = req.body.email;
  password = req.body.password;

  // Get user id by email
  let user = getUserByEmail(email);

  // If the user does not exist, send a 403 status code
  if (user === null) {
    res.status(403).send('Invalid email/password combination');

  // If the user exists but the password does not match, send a 403 status code
  } else if (getUserByEmail(email).password !== password) {
    res.status(403).send('Invalid email/password combination');

  // If the info is valid,
  } else {

    // Store the user in cookies
    res.cookie("user_id", user.id);

    // Redirect to the URLs page
    res.redirect("/urls");
  }
});


// Logging out
app.post("/logout", (req, res) => {

  // Clear the user ID cookie
  res.clearCookie('user_id');

  // Redirect to the URLs page
  res.redirect("/urls");
});


// Registering a new user
app.post("/register", (req, res) => {

  // Store the user's ID, email and password
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  // If email or password are blank, send a 400 status code
  if (email === '' || password === '') {
    res.status(400).send('Email and password cannot be blank');

  // If email is taken, send a 400 status code
  } else if (isEmailTaken(email)) {
    res.status(400).send('This email is already linked to an account');

  // Otherwise, store the email and password
  } else {

    // Add the user to the users database object
    users[userId] = { "id": userId, "email": email, "password": password};

    // Store the user id in cookies
    res.cookie("user_id", userId);
  
    // Redirect to the URLs page
    res.redirect("/urls");
  }
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});