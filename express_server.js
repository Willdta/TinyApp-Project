//TinyApp Project

var express = require("express");
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
var app = express();
//Our Port
var PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

//Cookie Session
app.use(cookieSession({
  name: 'session',
  keys: ['ajdkajskdjakdj']
}));

//Test urls
var urlDatabase = {
 "b2xVn2": {"longURL": "http://www.lighthouselabs.ca",
  			"shortURL": "b2xVn2",
  			"user_ID": "userRandomID"},
 
 "9sm5xK": {"longURL": "http://www.google.com",
  			"shortURL": "9sm5xK",
  			"user_ID": "userRandomID"}
};

//Test users
var users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple"
  },
 	"user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//Random Alphanumeric Generator
function generateRandomString() {
  var randomKey = '';
  var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  
  for (i = 0; i < 6; i++) {
    randomKey += keys.charAt(Math.floor(Math.random() * keys.length));
  }
  return randomKey;
}

//Check for user specificity
function urlsForUser(id) {
	var valid = {};

	for (key in urlDatabase) {
		if (urlDatabase[key]["user_ID"] === id) {
			valid[key] = urlDatabase[key];
		}
	}
	return valid;
}

//Allows us to use EJS
app.set('view engine', 'ejs');

//Test page
app.get("/", (req, res) => {
  res.end("Hello, welcome to my TinyApp application!");
});

//Main page checks for user to display their urls
app.get("/urls", (req, res) => {
	var validObj = urlsForUser(req.session["user_id"]);
  var templateVars = { urls: validObj, user: users[req.session["user_id"]]};
  res.render("urls_index", templateVars);
});

//Enter new url to shorten
app.get("/urls/new", (req, res) => {
  var templateVars = {urls: urlDatabase, user: users[req.session["user_id"]]};

  if (users[req.session["user_id"]]) {
		res.render("urls_new", templateVars);
  } 

  else {
  	res.redirect("/login");
  }
});

//Gets urls for the logged in user
app.get("/urls/:id", (req, res) => {
	var validObj = urlsForUser(req.session["user_id"]);
	var templateVars = {shortURL: req.params.id, urls: validObj, user: users[req.session["user_id"]]};
	
	//Only show urls for correct logged in user
	if (validObj[req.params.id]) {
		res.render("urls_show", templateVars);	
	} 

	else {
		res.send("This doesn't belong to you");
	}
});

//post urls
app.post("/urls", (req, res) => {
  
  //Tells us to generate random num for shortURL
  var shortURL = generateRandomString();
  
  //Unique users object
  urlDatabase[shortURL] = {
  	longURL: req.body.longURL,
  	shortURL: shortURL,
  	user_ID: req.session["user_id"]
  };
  res.redirect("/urls");
});

//Update URL
app.post("/urls/:id/update", (req, res) => {
  var shortURL = req.params.id;
  var longURL = req.body.id;
  urlDatabase[shortURL]["longURL"] = longURL;
  res.redirect('/urls');
});

//Delete URL
app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect('/urls');
});

//Redirect to Website
app.get("/u/:shortURL", (req, res) => {
	var shortURL = req.params.shortURL;
	var longURL = urlDatabase[shortURL];
	
	//Is the user logged in?
	if (!users[req.session["user_id"]]) {
		res.send('Please log in to have access to your short urls');
	}

	//Does the shortURL exist?
	else if (!urlDatabase[shortURL]) {
		res.send("This short URL doesn't exist");
	}
	
	//Redirect if it does
	else {
		longURL = urlDatabase[shortURL]["longURL"];
		res.redirect(longURL);
	}
});

//Registration
app.get("/register", (req, res) => {
	res.render("registration");
});

//Register Post
app.post("/register", (req, res) => {
	
	var email = req.body.email;
	var password = bcrypt.hashSync(req.body.password, 10);

	//Validation
	for (key in users) {
		if (users[key].email === email) {
			res.status(400).send('This email is already in use');
			return;
		}
	}		

	if (email === '' || req.body.password === '') {
		res.status(400).send('Please enter a valid email and password');
		return;
	}

	var randomID = generateRandomString();
	users[randomID] = {id: randomID, email: email, password: password};
	req.session.user_id = randomID;
	res.redirect('/urls');
});

//Render login page
app.get("/login", (req, res) => {
	res.render("login");
});

//Checks for valid credentials
app.post("/login", (req, res) => {
	var email = req.body.email;
	var password = req.body.password;

	for (key in users) {
		if(users[key].email === email && bcrypt.compareSync(password, users[key]["password"])) {
			req.session.user_id = key;
			res.redirect("/urls");
			return;
		}
	}
	res.status(401).send("Please enter a valid email and password");
});

//Logout/Clear Cookies
app.post("/logout", (req, res) => {
	req.session = null;
	res.redirect("/urls");
});

//Hosted port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});