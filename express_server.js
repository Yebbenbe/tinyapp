// express_server.js
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// getUser function, takes in email from reg and users object
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

// notes on cookies
// this will set a cookie labeled by user_id 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); // this is a route handler, it handles the path /urls.json
// it sends a response: the urlDatabase object in JSON format

// renders the page from template 'urls_index', the templateVars
app.get("/urls", (req, res) => {
  // this uses the cookie-parser middleware to access the username cookie
  // updated to look in the users object for the user_id cookie
  const user = users[req.cookies["user_id"]];
  // passes that specific user object to the template
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});



// handles login POST request
app.post('/login', (req, res) => {
 const { email, password } = req.body;
  // set a cookie named 'username' with the submitted value
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});

// renders the page from template 'urls_new'
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});


// handles logout POST request
app.post('/logout', (req, res) => {
  // clear the 'username' cookie
  res.clearCookie('user_id');
  // redirect back to the /urls page
  res.redirect('/urls');
});


// accepts POST requests from the form in urls_new.ejs
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  // Generate a random id
  const id = generateRandomString(6);
  // Add the id-longURL pair to the urlDatabase
  urlDatabase[id] = longURL;
  // Redirect to /urls/:id
  res.redirect(`/urls/${id}`);
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
  // Extract id parameter from the request
  const longURL = urlDatabase[id];
  // Retrieve longURL using id from urlDatabase
  const templateVars = { id: id, longURL: longURL, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
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

// renders the page from template 'register'
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register", templateVars);
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
  console.log(newUser);
  // set a user_id cookie containing the user's ID
  res.cookie("user_id", userId);
  // redirect the user to the /urls page
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/*  Below is example only
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);  // this sends a response of 'a = 1'
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);  // this sends a response of 'a = undefined', this would need a cookie
 });
*/
app.listen(PORT, () => {  // without this code, node will just run the code and exit
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset[Math.floor(Math.random() * charset.length)];
  }
  return randomString;
}
