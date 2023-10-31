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
