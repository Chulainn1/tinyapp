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

const urlDatabase = {
  b2xVn2: {longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID'},
  '9sm5xk': {longURL: 'http://www.google.com', userID: 'userRandomID'},
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('123', 10),
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('123', 10),
  },
};


// --------- ROUTING --------- //

// --------- / GET --------- //
// redirect to urls if logged in otherwise redirect to login page
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
    const errorMsg = "You gotta login!";
    return res.status(401).render('error', { user, errorMsg });
  }
  res.render("urls_index", templateVars);
});

// --------- url creation GET --------- //
// renders the creation page for logged in users.
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user };

  if (user) {
    res.render("urls_new", templateVars);
  } else {
    const errorMsg = "You must be logged in to Create a New URL";
    return res.status(401).render('error', { user, errorMsg});
  }

});

// --------- short url page GET --------- //
// renders the the shortURL page for logged in users.
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const userURLs = fetchUserURLs(id, urlDatabase);
  const shortURL = req.params.shortURL;
  const templateVars = {shortURL, longURL: userURLs[shortURL], user};

  if (!urlDatabase[shortURL]) {
    const errorMsg = "Hmmm, that short URL doesn't exist.";
    return res.status(401).render('error', { user, errorMsg});
  } else if (!user || !userURLs[shortURL]) {
    const errorMsg = "Hmmm, login to your account";
    return res.status(401).render('error', { user, errorMsg});
  } else {
    res.render("urls_show", templateVars);
  }

});

// --------- redirect GET --------- //
// redirects to longURL for an existing shortURL.
app.get("/u/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const shortURL = req.params.shortURL;
 
  if (!urlDatabase[shortURL]) {
    const errorMsg = "Hmmm, you sure that shortURL is correct?";
    return res.status(404).render('error', { user, errorMsg });
  } else {
    res.redirect(urlDatabase[shortURL].longURL);
  }

});

// --------- register GET --------- //
// renders registration page. Redirects to /urls if you're logged in.
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: null };

  if (!id) {
    res.render("register", templateVars);
  } else {
    res.redirect('/urls');
  }

});

// --------- login GET --------- //
// renders login page. Redirects to /urls if you're logged in.
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: null };
  
  if (!id) {
    res.render("login", templateVars);
  } else {
    res.redirect('/urls');
  }

});




// --------- urls POST --------- //
// adds a new url to the database if you've logged in.
app.post("/urls", (req, res) => {
  const id = req.session.user_id;
  
  if (id) {
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
  
  if (id && id === urlDatabase[shortURLToBeDeleted].userID) {
    delete urlDatabase[shortURLToBeDeleted];
    res.redirect('/urls');
  } else {
    const errorMsg = "Unauthorized";
    res.status(401).render('error', { user, errorMsg});
    
  }
});

// --------- edit url POST --------- //
// edit a shortURL if you're logged in.
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURLToBeEdited = req.params.shortURL;
  const shortURL = urlDatabase[shortURLToBeEdited];
  const id = req.session.user_id;
  const user = users[id];

  if (id && id === shortURL.userID) {
    shortURL.longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    const errorMsg = "You don't have permission to do that.";
    res.status(401).render('error', { user, errorMsg });
  }

});

// --------- login POST --------- //
// login with an existing account. bcrypt compares the password stored and the password entered.
app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const user = emailLookup(email, users);

  if (!user) {
    const errorMsg = `No user under this email: ${email}`;
    return res.status(403).render('error', {user ,errorMsg});
  }
   
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) {
      const errorMsg = "passwords don't match";
      return res.status(403).render('error', { user, errorMsg});
    }
    // set cookie and redirect to urls
    req.session.user_id = user.id;
    res.redirect('/urls');
  });

});

// --------- logout POST --------- //
// clears cookies and redirects to login
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// --------- registration POST --------- //
// properly entering all required info hashes password and results in a redirection to urls. If account exists, recieve an html error msg.
app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const id = generateRandomString();

  if (!password || !email) {
    const errorMsg = "An email AND password are requried";
    return res.status(400).render('error', {user: null, errorMsg});
  }

  if (emailLookup(email, users)) {
    const errorMsg = `An account already exists under ${email}`;
    return res.status(400).render('error', { user: null, errorMsg });
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {

      const user = { id, email, password: hash };

      // --- add user to database --- //
      users[id] = user;
      req.session.user_id = id;
      res.redirect("/urls");
    });
  });
});

// --------- Server Listen --------- //
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});


