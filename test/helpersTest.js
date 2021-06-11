const { assert } = require('chai');

const { emailLookup, fetchUserURLs } = require('../helpers.js');

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

describe('emailLookup', function() {
  it('should return a user with valid email', function() {
    const user = emailLookup("user@example.com", testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if the email is not in the database', function() {
    const user = emailLookup("Cthulu@ph'nglui.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});


const testURLs = {
  '1234': {
    longURL: 'https://www.youtube.com/',
    userID: 'hopscotch'
  },
  '5678': {
    longURL: 'https://github.com/',
    userID: 'yellowking'
  },
  '9012': {
    longURL: 'https://www.goodreads.com/',
    userID: 'yellowking'
  }
};


describe('fetchUserURLs', () => {
  it('should return the corresponding urls for a valid user', () => {
    const userUrls = fetchUserURLs('yellowking', testURLs);
    const expectedOutput = {
      "5678": "https://github.com/",
      "9012": "https://www.goodreads.com/"
    };
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should return an empty object for a non-valid user', () => {
    const userUrls = fetchUserURLs('cricket', testURLs);
    const expectedOutput = {};
    assert.deepEqual(userUrls, expectedOutput);
  });

});

