const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['abcde'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


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
  "s8hE2i": { 
    longURL: "http://www.google.ca",
    userID: "user2RandomID",
  },
};

// Database object for storing user info
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$sHGP3kw9kpsZnybB6GaxC.fsBldqczM5rLKDb5Pmq1DOiBuGx0Zgq", // purple-monkey-dinosaur
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$Mq.eGPk2CdKk5zzKxPheOuA0ssr3Y6JVK8lTSHO0EgrMUHQZ1axHG", // dishwasher-funk
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

  // Iterate through the users database
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }

  return false;
}


// Returns an object of short URLs made by a specific user
function urlsForUser(id) {

  // Create an object for storing url IDs
  let urlsMadeByUser = {};

  // Iterate through the url database
  for (let url in urlDatabase) {

    // If the user ID for the url matches,
    if (urlDatabase[url].userID === id) {

      // Copy the info for the url into the new object
      urlsMadeByUser[url] = {"longURL": urlDatabase[url].longURL, "userID": urlDatabase[url].userID};
    }
  }

  return urlsMadeByUser;
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
  let userId = req.session.user_id;

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
  let userId = req.session.user_id;

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
  let userId = req.session.user_id;

  // If the user is logged in, render the URL page only with links they created
  if (userId !== undefined) {

    // Get the user info from the users database
    let user = users[userId];

    // Using the urlsForUser function, filter the URL database for only URLs from the current user
    let urlDatabaseForUser = urlsForUser(userId);

    // Store the user and the user's URLs in templateVars
    const templateVars = { 
      user: user,
      urls: urlDatabaseForUser 
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
  let userId = req.session.user_id;

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

  // Get the user id from cookies
  let userId = req.session.user_id;

  // Store the shortened URL ID in a variable
  const id = req.params.id;

  // If the shortened url ID does not exist, send a 403 status code
  if (urlDatabase[id] === undefined) {
    res.status(403).send('This URL does not exist');
  
  // If the user is logged in, and the URL belongs to them,
  } else if (userId === urlDatabase[id].userID) {

    // Store the shortened URL ID and the long URL ID
    const templateVars = { 
      id: id, 
      longURL: urlDatabase[id].longURL 
    };

    // Render the urls_show page by passing the data in templateVars
    res.render("urls_show", templateVars);
  
  // If the user does not own the URL, send a 403 status code
  } else if (userId && userId !== urlDatabase[id].userID) {
    res.status(403).send('You do not have permission to edit this URL');

  // If the user is not logged in, send a 403 status code
  } else {
    res.status(403).send('You must be logged in to edit URLs');
  }
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
    res.status(400).send('This URL does not exist or is formatted incorrectly');
  }
});



//---------- POST ROUTES ----------//

// Deleting a shortened URL from the database
app.post("/urls/:id/delete", (req, res) => {

  // Get the user id from cookies
  let userId = req.session.user_id;

  // Store the id of a URL
  let id = req.params.id;

  // If the shortened url ID does not exist, send a 403 status code
  if (urlDatabase[id] === undefined) {
    res.status(403).send('This URL does not exist');

  // If the user is logged in, and the URL belongs to them,
  } else if (userId === urlDatabase[id].userID) {

    // Delete the id and URL from the database
    delete urlDatabase[id];

    // Redirect to the urls page
    res.redirect('/urls');

  // If the user does not own the URL, send a 403 status code
  } else if (userId && userId !== urlDatabase[id].userID) {
    res.status(403).send('You do not have permission to delete this URL');

  // If the user is not logged in, send a 403 status code
  } else {
    res.status(403).send('You must be logged in to delete URLs');
  }
});


// Adding a shortened URL to the database
app.post("/urls/:id", (req, res) => {

  // Get the user id from cookies
  let userId = req.session.user_id;
  
  // Store the id of a URL
  let id = req.params.id;

  // If the shortened url ID does not exist, send a 403 status code
  if (urlDatabase[id] === undefined) {
    res.status(403).send('This URL does not exist');

  // If the user is logged in, and the URL belongs to them,
  } else if (userId === urlDatabase[id].userID) {
    
    // Set the longURL to the new longURL
    urlDatabase[id] = {"userID": userId, "longURL": req.body.longURL};

    // Redirect to the page with the short URL
    res.redirect('/urls'); 

  // If the user does not own the URL, send a 403 status code
  } else if (userId && userId !== urlDatabase[id].userID) {
    res.status(403).send('You do not have permission to edit this URL');

  // If the user is not logged in, send a 403 status code
  } else {
    res.status(403).send('You must be logged in to edit URLs');
  }
});


// URL page
app.post("/urls", (req, res) => {

  // Get the user id from cookies
  let userId = req.session.user_id;

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
  let emailInput = req.body.email;
  let passwordInput = req.body.password;

  // Get user id from users database using inputted email
  let user = getUserByEmail(emailInput);

  // If the user does not exist, send a 403 status code
  if (user === null) {
    res.status(403).send('User not found');
  }


  // Get the stored hashed password from the database
  const storedPassword = getUserByEmail(emailInput).password;

  // Store whether the password is correct using bcryptjs
  let isPasswordCorrect =  bcrypt.compareSync(passwordInput, storedPassword);

  // If the user exists but the password does not match, send a 403 status code
  if (!isPasswordCorrect) {
    res.status(403).send('Invalid email/password combination');

  // If the user exists and the password matches,
  } else if (isPasswordCorrect) {

    // Store the user in cookies
    req.session.user_id = user.id;
    
    // Redirect to the URLs page
    res.redirect("/urls");
  }
});


// Logging out
app.post("/logout", (req, res) => {

  // Clear the user ID cookie
  req.session = null;

  // Redirect to the URLs page
  res.redirect("/login");
});


// Registering a new user
app.post("/register", (req, res) => {

  // Store the user's ID, email and password
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  // Hash the password using bcryptjs
  let hashedPassword = bcrypt.hashSync(password, 10);


  // If email or password are blank, send a 400 status code
  if (email === '' || password === '') {
    res.status(400).send('Email and password cannot be blank');

  // If email is taken, send a 400 status code
  } else if (isEmailTaken(email)) {
    res.status(400).send('This email is already linked to an account');

  // Otherwise, store the email and password
  } else {

    // Add the user info to the users database object
    users[userId] = { "id": userId, "email": email, "password": hashedPassword};

    // Store the user id in cookies
    req.session.user_id = userId;

    // Redirect to the URLs page
    res.redirect("/urls");
  }
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});