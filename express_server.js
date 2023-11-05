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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// handles login POST request
app.post('/login', (req, res) => {
  const { username } = req.body;
  // set a cookie named 'username' with the submitted value
  res.cookie('username', username);
  res.redirect('/urls');
});

// handles logout POST request
app.post('/logout', (req, res) => {
  // clear the 'username' cookie
  res.clearCookie('username');
  // redirect back to the /urls page
  res.redirect('/urls');
});

// renders the page from template 'urls_new'
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// accepts POST requests from the form in urls_new.ejs
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  // Generate a random id
  const id = generateRandomString();
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
  const templateVars = { id: id, longURL: longURL};
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

function generateRandomString(length = 6) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset[Math.floor(Math.random() * charset.length)];
  }
  return randomString;
}
