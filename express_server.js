// express_server.js
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// global variables
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// page functions
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset[Math.floor(Math.random() * charset.length)];
  }
  return randomString;
}

function getUser(searchEmail, usersDB) {
  // loop through each user object in users object
  for (const userObj in usersDB) {
    const user = users[userObj];
    if (user.email === searchEmail) {
      return user;
    }
  }
  return false;
}

// GET routes

// root page redirects to /urls
app.get("/", (req, res) => {
  res.send("Hello!");
  res.redirect("/urls");
});

// JSON string of the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// urls page
app.get("/urls", (req, res) => {
  // updated to look in the users object for the user_id cookie
  const user = users[req.cookies["user_id"]];
  // passes that specific user object to the template
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

// renders the page from template 'login'
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  // check if user is already logged in
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("login", templateVars);
  }
});

// renders the page from template 'urls_new'
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.status(302).redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

// route to single URL page - urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = users[req.cookies["user_id"]];
  // Extract id parameter from the request
  const longURL = urlDatabase[id];
  // Retrieve longURL using id from urlDatabase
  const templateVars = { id: id, longURL: longURL, user: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

// renders the page from template 'register'
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  // check if user is already logged in
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { urls: urlDatabase, user: user };
    res.render("register", templateVars);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// POST routes

// handles login POST request
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // look up the user by email
  const user = getUser(email, users);
  // if user not found
  if (!user) {
    res.status(400).send("Email not found");
    return;
  }
  // if user found, check if password matches
  if (user.password !== password) {
    res.status(403).send("Password does not match");
    return;
  }
  // else, set a cookie named 'user_id' to id property of user object - the six digit key
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

// handles logout POST request
app.post('/logout', (req, res) => {
  // clear the 'user_id' cookie
  res.clearCookie('user_id');
  // redirect back to the /urls page
  res.redirect('/login');
});

// accepts POST requests from the form in urls_new.ejs
app.post("/urls", (req, res) => {
  // get the user object from the global users object via the id in the cookie
  const user = users[req.cookies["user_id"]];
  // Check if user is not logged in
  if (!user) {
    res.status(403).send("You must be logged in to shorten URLs.");
  } else {
    const longURL = req.body.longURL;
    const id = generateRandomString(6);
    // add the id-longURL pair to the urlDatabase
    urlDatabase[id] = longURL;
    // redirect to /urls/:id
    res.redirect(`/urls/${id}`);
  }
});

// route to delete URL, POST from urls_index.ejs form
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("Short URL not found");
  }
});

// route to update URL, POST from urls_show.ejs form
app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("Short URL not found");
  }
});

// registration post
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // check if email or password are empty strings
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }
  // check if email is already registered
  const existingUser = getUser(email, users);
  // returns null if false, returns user object if true
  if (existingUser) {
    res.status(400).send("Email already registered");
    return;
  }
  // generate a random user id
  const userId = generateRandomString(6);
  // create a new user object with id, email, and password
  const newUser = {
    id: userId,
    email,
    password
  };
  // add the new user to the global users object
  users[userId] = newUser;
  // set a user_id cookie containing the user's ID
  res.cookie("user_id", userId);
  // redirect the user to the /urls page
  res.redirect("/urls");
});




app.listen(PORT, () => {  // without this code, node will just run the code and exit
  console.log(`Example app listening on port ${PORT}!`);
});


