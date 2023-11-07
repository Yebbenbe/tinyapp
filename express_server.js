// express_server.js
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['b!gC0zyK33?'],
  maxAge: 24 * 60 * 60 * 1000
}));


// global variables
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.lighthouselabs.ca/",
    userID: "abcdee",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "abcdee",
  },
};


const users = {
  abcdee: {
    id: "abcdee",
    email: "user@booble.com",
    // updated to use hashed password
    password: bcrypt.hashSync("password", 10),
  }
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
  for (const userId in usersDB) {
    const user = usersDB[userId];
    if (user.email === searchEmail) {
      return user;
    }
  }
  return false;
}

// loops through urldb creating an object of urls that belong to a specific user
function urlsForUser(userID) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLs;
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
  const user = users[req.session.user_id];
  if (!user) {
    res.send("Please log in or register to view your URLs.");
    return;
  }
  // must go after if check otherwise error
  const userURLs = urlsForUser(user.id);
  // passes that specific user object and userURLs to the template
  const templateVars = { urls: userURLs, user: user };
  res.render("urls_index", templateVars);
});

// renders the page from template 'login'
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
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

// route to single URL page - urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const user = users[req.session.user_id];
  const urlEntry = urlDatabase[shortURL];
  if (!user) {
    res.status(401).send("Please log in or register to view this URL.");
    return;
  }
  if (urlEntry.userID !== user.id) {
    res.status(403).send("You do not have permission to view this URL.");
    return;
  }
  const templateVars = { id: shortURL, longURL: urlEntry.longURL, user: req.session.user_id};
  res.render("urls_show", templateVars);
});

// renders the page from template 'register'
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
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

// dandles login POST request with bcrypt
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // look up the user by email
  const user = getUser(email, users);
  // iyuf user not found
  if (!user) {
    res.status(400).send("Email not found");
    return;
  }
  // compare the provided password with the hashed password in the database
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Password does not match");
    return;
  }
  // set a cookie named 'user_id' to the user's ID
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// handles logout POST request
app.post('/logout', (req, res) => {
  // clear the 'user_id' cookie
  req.session = null;
  // redirect back to the /urls page
  res.redirect('/login');
});

// accepts POST requests from the form in urls_new.ejs
app.post("/urls", (req, res) => {
  // get the user object from the global users object via the id in the cookie. Updated to cookie-session
  const user = users[req.session.user_id];
  const id = generateRandomString(6);
  // Check if user is not logged in
  if (!user) {
    res.status(403).send("You must be logged in to shorten URLs.");
  } else {
    const longURL = req.body.longURL;
    // add the urlDtabase[id] pair to the urlDatabase
    urlDatabase[id] = {
      longURL: longURL,
      userID: user.id
    };
    // redirect to /urls/:id
    res.redirect(`/urls/${id}`);
  }
});

// route to delete URL, POST from urls_index.ejs form
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const user = users[req.session.user_id];
  const urlEntry = urlDatabase[shortURL];
  if (urlEntry) {
    if (!user || urlEntry.userID !== user.id) {
      res.status(403).send("You do not have permission to delete this URL.");
      return;
    } else {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  } else {
    res.status(404).send("Short URL not found");
  }
});

// route to update URL, POST from urls_show.ejs form
app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const urlEntry = urlDatabase[shortURL];
  const newLongURL = req.body.newLongURL;
  const user = users[req.session.user_id];

  if (urlEntry) {
    if (!user || urlEntry.userID !== user.id) {
      res.status(403).send("You do not have permission to edit this URL.");
      return;
    } else {
      urlEntry.longURL = newLongURL;
      res.redirect("/urls");
    }
  } else {
    res.status(404).send("Short URL not found");
  }
});

// Registration post with bcrypt
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }
  // Check if email is already registered
  const existingUser = getUser(email, users);
  if (existingUser) {
    res.status(400).send("Email already registered");
    return;
  }
  // Generate a random user id
  const userId = generateRandomString(6);
  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Create a new user object with id, email, and hashed password
  const newUser = {
    id: userId,
    email,
    password: hashedPassword
  };
  // Add the new user to the global users object
  users[userId] = newUser;
  // Set a user_id cookie containing the user's ID, updated to cookie-session
  req.session.user_id = userId;
  // Redirect the user to the /urls page
  res.redirect("/urls");
});




app.listen(PORT, () => {  // without this code, node will just run the code and exit
  console.log(`Example app listening on port ${PORT}!`);
});


