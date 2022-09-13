const express = require("express");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
//prevents the Cross-Site Request Forgery(CSRF) attack on an application
//the name of the cookie to use to store the token secret (defaults to '_csrf').
const csrfProtection = csurf({ cookie: { httpOnly: true } });
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const parseForm = bodyParser.urlencoded({ extended: false });

// You should actually store your JWT secret in your .env file - but to keep this example as simple as possible...
const jwtsecret = "the most secret string of text in history";

const fullName = "John Moran";

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
	console.log(req.cookies);
	jwt.verify(req.cookies.cookieToken, jwtsecret, function (err, decoded) {
		if (err) {
			res.render("login");
		} else {
			res.render("logged-in", { name: decoded.name });
		}
	});
});

app.post("/login", (req, res) => {
	if (req.body.username === "john" && req.body.password === "password") {
		res.cookie("cookieToken", jwt.sign({ name: fullName, favColor: "green" }, jwtsecret), { httpOnly: true });
		res.redirect("/");
	} else {
		res.send(`<p>Incorrect login. <a href="/">Go back home.</a></p>`);
	}
});

app.get("/logout", (req, res) => {
	res.clearCookie("cookieToken");
	res.redirect("/");
});

// have a GET request that is token protected but doesnt need CSRF because it is not modifying any data
app.get("/get-secret-data", mustBeLoggedIn, (req, res) => {
	res.send(
		`<p>Welcome to the top secret data page. Only logged in users like you can access this amazing content. <a href="/">Go back home.</a></p>`
	);
});

// example json / api endpoint
// app.get("/ajax-example", mustBeLoggedIn, (req, res) => {
// 	res.json({ message: "Two plus two is four and grass is green." });
// });
app.get("/ajax-example", mustBeLoggedIn, (req, res) => {
	res.render("ajax-page", { messagex: "aubamayeng" });
});

app.get("/transfer-money", csrfProtection, function (req, res) {
	// pass the csrfToken to the view
	res.render("transfer-money-form", { csrf: req.csrfToken() });
});

app.post("/process", function (req, res) {
	console.log(parseForm);
	res.send("Successfully Validated!!");
	console.log("Success!");
});

// Our token checker middleware
function mustBeLoggedIn(req, res, next) {
	jwt.verify(req.cookies.cookieToken, jwtsecret, function (err, decoded) {
		if (err) {
			res.redirect("/");
		} else {
			next();
		}
	});
}

app.listen(3000, function () {
	console.log("started at 3000");
});
