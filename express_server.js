const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
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
app.use(cookieParser());

// function generateRandomString() {
//   return Math.random().toString(36).replace("0.", "").substring(0, 6);
// }

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };
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
  let user_id = req.cookies["user_id"];
  const userURLs = urlsForUser(user_id);
  const templateVars = { user: users[user_id], urls: userURLs };
  res.render("urls_index", templateVars);
});

//Route: get register page
app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const email = req.body["email"];
  const password = req.body["password"];
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.send("one of the fields is invalid");
  }
  if (authenticateUser(users, email)) {
    res.send("account already exists");
  }
  user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email: email,
    password: hashedPassword,
  };
  res.cookie("user_id", user_id);
  return res.redirect("urls/");
});

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { user: users[user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const hashedPassword = bcrypt.hashSync(password, 10);
  const user = authenticateUser(users, email);
  // console.log("hashed user input", hashedPassword);
  // console.log("user input:", password);
  // console.log("user password in database:", user.password);
  // console.log(!bcrypt.compareSync(password, user.password));
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.send("Invalid email or password");
  }

  res.cookie("user_id", user.id).redirect("/urls");

  //check for empty email or password
});

// const getUserByEmail = (database, email) => {
//   for (let data in database) {
//     if (email === database[data]["email"]) {
//       return database[data];
//     }
//     return undefined;
//   }
// };

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});

//route: GET, update with user login by adding template
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  if (!user_id) {
    //res.send("Please log in or register");
    res.redirect("/login");
  }
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//route: ADD new url
app.post("/urls", (req, res) => {
  //console.log(req.body); // Log the POST request body to the console

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id,
  };

  res.redirect(`/urls/${shortURL}`); //used tobe res.redirect(`/urls/${randomShort}`);
});

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
  let user_id = req.cookies["user_id"];
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
