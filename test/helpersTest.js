// Import chai and helper functions
const { assert } = require('chai');
const { generateRandomString, getUserByEmail, isEmailTaken, urlsForUser } = require('../helpers.js');

// Test database
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// URL database test
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


// Test statements for generateRandomString
describe('generateRandomString', function() {

  it('should return a random string with 6 characters', function() {

    assert.equal(generateRandomString().length, 6);
  });

});


// Test statements for getUserByEmail
describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {

    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur" };
    
    assert.deepEqual(user, expectedUser);
  });

  it('should return undefined for an email that does not exist in the database', function() {

    const user = getUserByEmail("null@example.com", testUsers);
    const expectedUser = undefined;

    assert.deepEqual(user, expectedUser);
  });

});


// Test statements for isEmailTaken
describe('isEmailTaken', function() {

  it('should return true if the email exists in the database', function() {

    const email = isEmailTaken("user@example.com", testUsers);
    
    assert.deepEqual(email, true);
  });

  it('should return false if the email does not exist in the database', function() {

    const email = isEmailTaken("null@example.com", testUsers);

    assert.deepEqual(email, false);
  });

});


// Test statements for urlsForUser
describe('urlsForUser', function() {

  it('should return an object containing all urls submitted by a user', function() {

    const object1 = urlsForUser("userRandomID", urlDatabase);

    const object2 = {
      "b2xVn2": { 
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      },
      "9sm5xK": { 
        longURL: "http://www.google.com",
        userID: "userRandomID",
      }
    };

    assert.deepEqual(object1, object2);
  });
});

