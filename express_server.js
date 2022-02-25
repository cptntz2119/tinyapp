const express = require("express");
const app = express();
const bodyParser = require("body-parser");
//var cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
//const userDatabase = require("./data/userData");
const {
  fetchUserInfo,
  authenticateUser,
  generateRandomString,
} = require("./helpers/userHelpers");

const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

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

const urlsForUser = (id) => {
  const userURLs = {};
  for (obj in urlDatabase) {
    if (urlDatabase[obj].userID === id) {
      userURLs[obj] = urlDatabase[obj];
    }
  }
  return userURLs;
};

//use ejs to render new pages, when add login update template
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userURLs = urlsForUser(user_id);
  const templateVars = { user: users[user_id], urls: userURLs };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${shortURL}`); //used tobe res.redirect(`/urls/${randomShort}`);
});

//Route: get register page
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.send("one of the fields is invalid");
  }
  if (authenticateUser(users, email)) {
    res.send("account already exists");
  }
  const id = generateRandomString();

  users[id] = { id, email, password: hashedPassword };
  console.log(users);
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = { user: users[user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const hashedPassword = bcrypt.hashSync(password, 10);
  const user = authenticateUser(users, email);
  console.log("user :", user);
  // console.log(!bcrypt.compareSync(password, user.password));
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.send("Invalid email or password");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");

  //check for empty email or password
});

app.post("/logout", (req, res) => {
  //res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

//route: GET, update with user login by adding template
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    //res.send("Please log in or register");
    res.redirect("/login");
  }
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//route: ADD new url

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.send("URL not found. Create a new one pls");
  }
});

//route: UPDATE
app.post("/urls/:shortURL", (req, res) => {
  //console.log("route update", req.params);
  //console.log(req.body);
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
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
  let user_id = req.session.user_id;
  //const userURLs = urlsForUser(user_id);
  if (user_id) {
    const shortURL = req.params.shortURL;
    console.log(req.params);
    console.log(req.params.shortURL);
    const templateVars = {
      shortURL: req.params.shortURL, //get shortURL, it is obj key
      longURL: urlDatabase[shortURL].longURL,
      user: users[user_id],
    };
    console.log(templateVars);
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on prot ${PORT}`);
});
