var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require("cookie-parser");
app.use(cookieParser());

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

//Allows us to use EJS
app.set('view engine', 'ejs');

// app.use((req, res, next) => {
// 	console.log(req.method, req.url);
// 	next();
// })

//Test
app.get("/", (req, res) => {
  res.end("Hello");
});

//Form Input
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
	//The randomly generated code
	let shortURL = req.params.shortURL
	//It's long URL
	let longURL = urlDatabase[shortURL]
	console.log('Redirected to.. ',longURL);
	res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  //Tells us to generate random num for shortURL
  var shortURL = generateRandomString();
	//Logs whatever we type in the form  
  console.log(req.body.longURL);
  //Logs random generated num
  console.log(shortURL);
  //Assigns random generated num to the url given in form
  urlDatabase[shortURL] = req.body.longURL;
  res.send("Ok");
});

//Update URL
app.post("/urls/:id/update", (req, res) => {
  var shortURL = req.params.id;
  let longURL = req.body.id;
  console.log(longURL)
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

//Delete URL
app.post("/urls/:id/delete", (req, res) => {
	console.log(urlDatabase[req.params.id]);
	delete urlDatabase[req.params.id];
	res.redirect('/urls');
});

//Cookie
app.post("/login/", (req, res) => {
	res.cookie("username", req.body.username);
	res.redirect('/urls');
});

//Logout
app.post("/logout", (req, res) => {
	res.clearCookie("username", req.body.username);
	res.redirect('/urls');
});

//urls: urlDatabase points to our object
//with its keys and values
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

//Gets long url by inputting its short URL in browser
app.get("/urls/:id", (req, res) => {
	//Pass in second object to let us know what info we
	//want to grab, in this case the urlDatabase object
	let templateVars = {shortURL: req.params.id, urls: urlDatabase, username: req.cookies.username};
  res.render("urls_show", templateVars);
});

//Get JSON data
app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

//Hosted port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});