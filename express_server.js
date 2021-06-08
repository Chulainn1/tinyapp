const express = require("express"); 
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

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
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let randoStr = generateRandomString();
  urlDatabase[randoStr] = req.body.longURL;
  res.redirect(`/urls/${randoStr}`);
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
