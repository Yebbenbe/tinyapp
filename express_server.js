const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

app.listen(PORT, () => {  // without this code, node will just run the code and exit
  console.log(`Example app listening on port ${PORT}!`);
});
