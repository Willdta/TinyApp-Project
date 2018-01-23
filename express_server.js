var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Random String Generator
function generateRandomString() {
  var randomKey = '';
  var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
  for (i = 0; i < 6; i++) {
    randomKey += keys.charAt(Math.floor(Math.random() * keys.length));
  }
  return randomKey;
}

//Allow us to use EJS
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.end("Hello!");
});

//Form Input
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
	
	//The randomly generated code
	let shortURL = req.params.shortURL
	console.log('this is the shortURL: ',shortURL)

	//lighthouselabs.ca
	let longURL = urlDatabase[shortURL]
	console.log('This is the Database: ',urlDatabase)
	console.log(longURL);
	res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  //Implement function to var
  var shortURL = generateRandomString();
  console.log(req.body.longURL);
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.send("Ok");
});

//URLS INDEX EJS
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//urls show
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

//Get JSON data
app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

//What port to host on?
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});