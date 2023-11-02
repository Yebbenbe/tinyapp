const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id; 
  // Extract id parameter from the request
  const longURL = urlDatabase[id]; 
  // Retrieve longURL using id from urlDatabase
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
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
