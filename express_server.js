// express_server.js
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUser, generateRandomString, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['b!gC0zyK33?'],
  maxAge: 24 * 60 * 60 * 1000
}));


// test databases
const urlDatabase = {
  111111: {
    longURL: "https://www.lighthouselabs.ca/",
    userID: "abcdee",
  },
  222222: {
    longURL: "https://www.google.com/",
    userID: "abcdee",
  }
};
const users = {
  abcdee: {
    id: "abcdee",
    email: "user@booble.com",
    password: bcrypt.hashSync("password", 10),
  }
};

// GET routes
// root redirect to /urls
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// urls page
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.send("Please log in or register to view your URLs.");
  }
  const userURLs = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls: userURLs, user: user };
  res.render("urls_index", templateVars);
});

// login page
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("login", templateVars);
  }
});

// urls/new page
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase, user: user };
    res.render("urls_new", templateVars);
  }
});

// /u/:id redirect route
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlEntry = urlDatabase[shortURL];
  if (urlEntry) {
    res.status(302).redirect(urlEntry.longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

// urls/:id page
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const user = users[req.session.user_id];
  const urlEntry = urlDatabase[shortURL];

  if (!urlEntry) {
    return res.status(404).send("Short URL not found");
  }
  if (!user) {
    return res.status(401).send("Please log in or register to view this URL.");
  }
  if (urlEntry.userID !== user.id) {
    return res.status(403).send("You do not have permission to view this URL.");
  }

  const templateVars = { id: shortURL, longURL: urlEntry.longURL, user: req.session.user_id };
  res.render("urls_show", templateVars);
});

// register page
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { urls: urlDatabase, user: user };
    res.render("register", templateVars);
  }
});

// POST routes
// new URL
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const id = generateRandomString(6);
  if (!user) {
    res.status(403).send("You must be logged in to shorten URLs.");
  } else {
    const longURL = req.body.longURL;
    urlDatabase[id] = {
      longURL: longURL,
      userID: user.id
    };
    res.redirect(`/urls/${id}`);
  }
});

// delete URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const user = users[req.session.user_id];
  const urlEntry = urlDatabase[shortURL];
  if (urlEntry) {
    if (!user || urlEntry.userID !== user.id) {
      return res.status(403).send("You do not have permission to delete this URL.");
    } else {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  } else {
    res.status(404).send("Short URL not found");
  }
});

// update URL
app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const urlEntry = urlDatabase[shortURL];
  const newLongURL = req.body.newLongURL;
  const user = users[req.session.user_id];
  if (urlEntry) {
    if (!user || urlEntry.userID !== user.id) {
      return res.status(403).send("You do not have permission to edit this URL.");
    } else {
      urlEntry.longURL = newLongURL;
      res.redirect("/urls");
    }
  } else {
    res.status(404).send("Short URL not found");
  }
});

// login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUser(email, users);
  if (!user) {
    return res.status(400).send("Email not found");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password does not match");
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Register
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }
  const existingUser = getUser(email, users);
  if (existingUser) {
    return res.status(400).send("Email already registered");
  }

  const userId = generateRandomString(6);
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: userId,
    email,
    password: hashedPassword
  };
  users[userId] = newUser;
  req.session.user_id = userId;
  res.redirect("/urls");
});

// logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


