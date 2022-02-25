const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
//helper functions
const {
  urlsForUser,
  getUserByEmail,
  generateRandomString,
} = require("./helpers/userHelpers");
const PORT = 8080;

//middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

//all data
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//use ejs to render new pages, when add login update template
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userURLs = urlsForUser(user_id, urlDatabase);
  const templateVars = { user: users[user_id], urls: userURLs };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

//Route: get register page
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  //console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.send("one of the fields is invalid");
  }
  if (getUserByEmail(users, email)) {
    res.send("account already exists");
  }

  const id = generateRandomString();
  users[id] = { id, email, password: hashedPassword };
  //console.log(users);
  req.session.user_id = id;
  res.redirect("/urls");
});

//Route: log in
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(users, email);
  //console.log("user :", user);
  // console.log(!bcrypt.compareSync(password, user.password));
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.send("Invalid email or password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

//Route: add new urls
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    //res.send("Please log in or register");
    res.redirect("/login");
  }
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//Route: access shortURL link
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.send("URL not found. Create a new one pls");
  }
});

//Route: UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls/");
});

//Route: DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  //console.log(req.params);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Route: GET page for logged in user
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id) {
    const shortURL = req.params.shortURL;
    // console.log(req.params);
    // console.log(req.params.shortURL);
    const templateVars = {
      shortURL: req.params.shortURL, //get shortURL, it is obj key
      longURL: urlDatabase[shortURL].longURL,
      user: users[user_id],
    };
    //console.log(templateVars);
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on prot ${PORT}`);
});
