// --------- helper functions --------- //
const generateRandomString = function() {
  let alnu = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let len = 6;
  let result = '';
  for (let i = len; i > 0; --i) {
    result += alnu[Math.floor(Math.random() * alnu.length)];
  }
  return result;
};

const emailLookup = function(email, usersData) {
  for (const user in usersData) {
    if (usersData[user].email === email) {
      return usersData[user];
    }
  }
  return undefined;
};

const fetchUserURLs = function(id, data) {
  let urls = {};
  for (const shortURL in data) {
    if (data[shortURL].userID === id) {
      urls[shortURL] = data[shortURL].longURL;
    }
  }
  console.log(urls);
  return urls;
};

module.exports = { emailLookup, fetchUserURLs, generateRandomString };