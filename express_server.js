const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// ----------------------------Day 1 ------------------------------ //
function generateRandomString() {
  let alnu = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let len = 6;
  let result = '';
  for (let i = len; i > 0; --i) {
    result += alnu[Math.floor(Math.random() * alnu.length)];
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  let randoStr = generateRandomString();
  urlDatabase[randoStr] = req.body.longURL;
  res.redirect(`/urls/${randoStr}`);
  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURLToBeDeleted = req.params.shortURL;
  // console.log("deleted shortURL:", shortURLToBeDeleted)
  delete urlDatabase[shortURLToBeDeleted];

  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURLToBeEdited = req.params.shortURL;
  // console.log("editing shortURL:", shortURLToBeEdited)
  // console.log(req.body.longURL)
  if (urlDatabase[shortURLToBeEdited] && req.body.longURL) {
    urlDatabase[shortURLToBeEdited] = req.body.longURL;
  } else {
    return res.json({error: "short url does not exist"});
  }

  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log(typeof req.body.username);
  res.cookie("username", req.body.username);

  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
