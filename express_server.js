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

//use ejs to render new pages, when add login update template
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//route: GET, update with user login by adding template
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//route: ADD new url
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const randomShort = generateRandomString();
  urlDatabase[randomShort] = req.body.longURL;

  res.redirect(`/urls/${randomShort}`);
});

//route: introduce cookies so that user login and log out is added
app.post("/login", (req, res) => {
  //let username = req.cookies.username;
  res.cookie("username", req.body.username);
  console.log("cookie usename is: ", req.body.username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  //console.log("cookie usename is: ", req.body.username);
  res.redirect("/urls");
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
app.get("/urls/:shortURL", (request, response) => {
  const templateVars = {
    shortURL: request.params.shortURL, //get shortURL, it is obj key
    longURL: urlDatabase[request.params.shortURL],
  };
  response.render("urls_show", templateVars);
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

// check if fetch will get result of set, answer is no. from diffent page
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on prot ${PORT}`);
});
