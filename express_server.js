var express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//URLS
var urlDatabase = {
 "b2xVn2": {"longURL": "http://www.lighthouselabs.ca",
  					"shortURL": "b2xVn2",
  					"user_ID": "userRandomID"},
 
 "9sm5xK": {"longURL": "http://www.google.com",
  					"shortURL": "9sm5xK",
  					"user_ID": "userRandomID"}
};

//USERS
const users = { 
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

//Random String Generator
function generateRandomString() {
  var randomKey = '';
  var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
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
	let longURL = urlDatabase[shortURL]["longURL"];
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
	var password = bcrypt.hashSync(req.body.password, 10);

	for (key in users) {
		if (users[key].email === email) {
			console.log('Match found');
			res.status(400).send('found a match');
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
	console.log(users[randomID]['id']);
	console.log(password);
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
  urlDatabase[shortURL] = {
  	longURL: req.body.longURL,
  	shortURL: shortURL,
  	user_ID: req.cookies["user_id"]
  };
	console.log(urlDatabase[shortURL]);
  res.redirect("/urls");
});

//Update URL
app.post("/urls/:id/update", (req, res) => {
  var shortURL = req.params.id;
  let longURL = req.body.id;
  console.log(longURL)
  urlDatabase[shortURL]["longURL"] = longURL;
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
	let email = req.body.email;
	let password = req.body.password;

	for (key in users) {
		if(users[key].email === email && bcrypt.compareSync(password, users[key]["password"])) {
			res.cookie('user_id', key);
			// console.log('hashed: ', hash);
			res.redirect("/urls");
			return;
		}
	}
	res.status(401).send('Not a valid username/password');
});

//Logout/Clear Cookies
app.post("/logout", (req, res) => {
	res.clearCookie("user_id");
	res.redirect('/urls');
});

//urls: urlDatabase points to our object
//with its keys and values
app.get("/urls", (req, res) => {
	let validObj = urlsForUser(req.cookies["user_id"]);
  let templateVars = { urls: validObj, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

//Gets long url by inputting its short URL in browser
app.get("/urls/:id", (req, res) => {
	//Pass in second object to let us know what info we
	//want to grab, in this case the urlDatabase object
	let validObj = urlsForUser(req.cookies["user_id"]);
	let templateVars = {shortURL: req.params.id, urls: validObj, user: users[req.cookies["user_id"]]};
	
	console.log('this is the object',validObj);
	console.log('this is the shorturl',req.params.id);
	console.log('does it exist',validObj[req.params.id]);	


	if (validObj[req.params.id]) {
		res.render("urls_show", templateVars);	
	} else {
		res.send("Doesn't exist");
	}

});

//Get JSON data
app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

//Hosted port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});