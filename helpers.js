//---------- HELPER FUNCTIONS -----------//


// Generate a random string of 6 characters
let generateRandomString = function() {

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
};


// Return an user in the database given an email
let getUserByEmail = function(email, userDatabase) {

  // Iterate through the database
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return userDatabase[userId];
    }
  }

  return undefined;
};


// Returns true if an email is taken
let isEmailTaken = function(email, userDatabase) {

  // Iterate through the users database
  for (let userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return true;
    }
  }

  return false;
};


// Returns an object of short URLs made by a specific user
let urlsForUser = function(id, urlDatabase) {

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
};


// Export the getUserByEmail function
module.exports = {generateRandomString, getUserByEmail, isEmailTaken, urlsForUser};