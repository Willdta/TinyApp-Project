var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require("cookie-parser");
app.use(cookieParser());

//URLS
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//USERS
const users = { 
  // "userRandomID": {
  //   id: "userRandomID", 
  //   email: "user@example.com", 
  //   password: "purple-monkey-dinosaur"
  // },
 	// "user2RandomID": {
  //   id: "user2RandomID", 
  //   email: "user2@example.com", 
  //   password: "dishwasher-funk"
  // }
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

//Test
app.get("/", (req, res) => {
  res.end("Hello");
});

//Form Input
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};

  if (users[req.cookies["user_id"]]) {
		res.render("urls_new", templateVars);
  } else {
  		res.redirect("/login");
    }
});

app.get("/u/:shortURL", (req, res) => {
	//The randomly generated code
	let shortURL = req.params.shortURL;
	//It's long URL
	let longURL = urlDatabase[shortURL];
	console.log("Redirected to.. ",longURL);
	res.redirect(longURL);
});

//Registration
app.get("/register", (req, res) => {
	res.render("registration");
});

//Register Post
app.post("/register", (req, res) => {
	var email = req.body.email;
	var password = req.body.password;

	for (key in users) {
		if (users[key].email === email) {
			console.log('Match found');
			res.status(400);
			res.send('found a match');
			return;
		}
	}

	if (email === '' || password === '') {
		res.status(400);
		res.send('please enter');
		return;
	}
	
	var randomID = generateRandomString();
	users[randomID] = {id: randomID, email: email, password: password};
	res.cookie("user_id",randomID);
	console.log('users array after reg',users);
	res.redirect('/urls');
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

//Login
app.get("/login", (req, res) => {
	// let templateVars = {user: users[req.cookies["user_id"]]};
	// console.log('users array:', users, '\nthis user:', templateVars);
	// res.render("login", templateVars);
	res.render("login");
});

//Cookie
app.post("/login", (req, res) => {
	// res.cookie("username", req.body.username);
	let email = req.body.email;
	let password = req.body.password;

	for (key in users) {
		if(users[key].email === email && users[key].password === password) {
			res.cookie('user_id', key);
			res.redirect("/urls");
			return;
		}
	}
	res.status(401).send('nope');
});

//Logout/Clear Cookies
app.post("/logout", (req, res) => {
	res.clearCookie("user_id");
	res.redirect('/urls');
});

//urls: urlDatabase points to our object
//with its keys and values
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

//Gets long url by inputting its short URL in browser
app.get("/urls/:id", (req, res) => {
	//Pass in second object to let us know what info we
	//want to grab, in this case the urlDatabase object
	let templateVars = {shortURL: req.params.id, urls: urlDatabase, user: users[req.cookies["user_id"]]};
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