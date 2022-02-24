const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).replace("0.", "").substring(0, 6);
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// const userDB = {
//   //use user_id look up for user
//   userRandomID: users["userRandomID"],
//   user2RandomID: users["user2RandomID"],
// };

//use ejs to render new pages, when add login update template
app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//route: introduce cookies so that user login and log out is added
app.post("/login", (req, res) => {
  //let username = req.cookies.username;
  res.cookie("username", req.body.username);
  console.log("cookie usename is: ", req.body.username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  //console.log("cookie usename is: ", req.body.username);
  res.redirect("/urls");
});

//route: GET, update with user login by adding template
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//route: ADD new url
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const randomShort = generateRandomString();
  urlDatabase[randomShort] = req.body.longURL;

  res.redirect(`/urls/`); //used tobe res.redirect(`/urls/${randomShort}`);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    res.send("URL not found. Create a new one pls");
  }
});

//route: UPDATE
app.post("/urls/:shortURL", (req, res) => {
  //console.log("route update", req.params);
  //console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

// route: DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//route: GET new url page
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];

  const templateVars = {
    shortURL: req.params.shortURL, //get shortURL, it is obj key
    longURL: urlDatabase[req.params.shortURL],
    user: users[user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Route: get register page
app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: req.body.password,
  };
  //check for empty email or password
  if (!req.body.email || !req.body.password) {
    return res.redirect("/register");
  }
  //check for existence of email address
  for (let user in users) {
    if (user.email === req.body.email) {
      return res.redirect("/register");
    }
  }
  console.log(users);
  res.cookie("user_id", user_id);
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on prot ${PORT}`);
});
