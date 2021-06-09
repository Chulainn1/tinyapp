const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

const users = {
  "qwe": {
    id: "qwe", 
    email: "a@a.com", 
    password: "123"
  },
 "asd": {
    id: "asd", 
    email: "b@b.com", 
    password: "321"
  }

}




app.get("/urls", (req, res) => {
  console.log(req.cookies)
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    urls: urlDatabase,
    user 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: null }
  res.render("register", templateVars);
})





app.post("/urls", (req, res) => {
  // console.log(req.body);
  let randoStr = generateRandomString();
  urlDatabase[randoStr] = req.body.longURL;
  res.redirect(`/urls/${randoStr}`);
  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURLToBeDeleted = req.params.shortURL;
  delete urlDatabase[shortURLToBeDeleted];

  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURLToBeEdited = req.params.shortURL;

  if (urlDatabase[shortURLToBeEdited] && req.body.longURL) {
    urlDatabase[shortURLToBeEdited] = req.body.longURL;
  } else {
    return res.json({error: "short url does not exist"});
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log(typeof req.body.username);
  res.cookie("user", req.body.email);

  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect('/urls');
});

const emailLookup = function (email, usersData) {
  for(const user in usersData) {
    if (usersData[user].email === email) {
      return usersData[user];
    }
  }
  return 
}; 

app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  if (!password || !email) {
    return res.status(400).send("An email AND password are requried");
  }
  if(emailLookup(email, users)) {
    return res.status(400).send(`An account already exists under ${usersData[user]}`)
  }

  const id = generateRandomString();
  const user = { id, email, password }
  users[id] = user;
  console.log(user)
  res.cookie("user_id", id)
  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


