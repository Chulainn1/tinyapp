const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));


// --------- import helper functions --------- //

const {emailLookup, fetchUserURLs, generateRandomString } = require('./helpers');


// --------- varibles --------- //

const urlDatabase = {};
const users = {};

// --------- ROUTING --------- //


app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


// --------- urls index page GET --------- //
// shows urls that belong to the user
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const userURLs = fetchUserURLs(id, urlDatabase);
  const templateVars = { user, urls: userURLs };

  if (!user) {
    return res.status(401).send("You gotta login!");
  }
  res.render("urls_index", templateVars);
});

// --------- url creation GET --------- //
// renders the creation page for logged in users only.
app.get("/urls/new", (req, res) => { 
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };

  if (!user) {
    res.redirect("/register")
  }

  res.render("urls_new", templateVars);
});

// --------- short url page GET --------- //
// renders the created short url for a given long url.
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userURLs = fetchUserURLs(id, urlDatabase);
  const user = users[id];
  const templateVars = {shortURL, longURL: userURLs[shortURL], user};

  if (!urlDatabase[shortURL]) {
    return res.status(401).send("Hmmm, that short URL doesn't exist.")
  } else if (!user || !userURLs[shortURL]){
    return res.status(401).send("Hmmm, you sure that is your URL?")
  } else {
    res.render("urls_show", templateVars);
  }

});

// --------- redirect GET --------- //
// redirects to long url page.
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else { 
    return res.status(404).send("Hmmm, you sure that is the right shortURL?");
  }

});

// --------- register GET --------- //
// renders registration page.
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: null };
  if (id) {
    res.redirect('/urls')
  }
  res.render("register", templateVars);
});

// --------- login GET --------- //
// renders login page.
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: null };
  if (id) {
    res.redirect('/urls')
  }
  res.render("login", templateVars);
});




// --------- urls POST --------- //
// adds a new url to the database while redirecting to short url page
app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  
  if(id) {
    let randoStr = generateRandomString();
    urlDatabase[randoStr] = {longURL: req.body.longURL, userID: id};
    res.redirect(`/urls/${randoStr}`);
  } else {
    return res.status(401).send("You gotta make an account first!");
  }
});

// --------- delete url POST --------- //
// deletes a url that belongs to a logged in user
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURLToBeDeleted = req.params.shortURL;
  const id = req.session.user_id;
  const user = users[id];

  if (!user) {
    return res.redirect("/login");
  } else {
    delete urlDatabase[shortURLToBeDeleted];
  }
  
  res.redirect('/urls');
});

// --------- edit url POST --------- //
// edit a short urls corresponding long url only if logged in.
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURLToBeEdited = req.params.shortURL;
  const shortURL = urlDatabase[shortURLToBeEdited];
  const id = req.session.user_id;
  const user = users[id];
  
  // if (!user) {
  //   return res.redirect("/login");
  // } else if (shortURL && req.body.longURL) {
  //   shortURL.longURL = req.body.longURL;
  // } else {
  //   return res.json({error: "short url does not exist"});
  // }

  if (id && id === shortURL.user_id) {
    shortURL.longURL = req.body.longURL
    res.redirect('/urls');
  } else {
    return res.status(401).send("Hmm, you don't have permission to do that.")
  }


});

// --------- login POST --------- //
// upon entering correct login info, redirect to urls index.
app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const user = emailLookup(email, users);
  if (!user) {
    return res.status(403).send(`No user under this email: ${email}`);
  }
   
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      return res.status(403).send("passwords don't match");
    }
    // set cookie and redirect to urls
    req.session.user_id = user.id;
    res.redirect('/urls');
  });
});

// --------- logout POST --------- //
// clears cookies and redirects to urls index
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// --------- registration POST --------- //
// properly entering credentials results in a redirection to urls.
app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const id = generateRandomString();

  if (!password || !email) {
    return res.status(400).send("An email AND password are requried");
  }
  if (emailLookup(email, users)) {
    return res.status(400).send(`An account already exists under ${email}`);
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {

      const user = { id, email, password: hash };
      console.log(hash);
      // --- add user to database --- //
      users[id] = user;
      req.session.user_id = id;
      res.redirect("/urls");
    });
  });
  
});

// --------- Server Listen --------- //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


