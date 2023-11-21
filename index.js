// Import required modules
const axios = require("axios");
const mongoose = require("mongoose");
const express = require('express');
const layouts = require("express-ejs-layouts");
const connectFlash = require('connect-flash');
const methodOverride = require("method-override");
const expressSession = require("express-session");
const expressValidator = require("express-validator");
const { body, validationResult } = require('express-validator');
const passport = require("passport");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const checkLoggedIn = require('./checkLoginStatus');
// const checkToken = require('./client');
const socketio = require("socket.io");
// Import controllers
const chatController = require('./controllers/chatController');
const jwt = require("jsonwebtoken");
const router = require("./routes/index");
// const { ensureAuthenticated } = require('../config/auth');
// Initialize Express app and router
const app = express();
const auth = require('./middleware/auth');
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/brandeis_saa');

// Middleware configuration
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(layouts);
app.use(cookieParser("secret_passcode"));

app.use(
  methodOverride("_method", {
    methods: ["POST", "GET", "PUT", "DELETE"],
  })
);

app.use(
  expressSession({
    secret: "secret_passcode",
    cookie: {
      maxAge: 40000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.user = req.user;
  next();
});

// Token authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "secret_key", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
// Configure app to use JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(expressValidator());

// Use router in the app
app.use("/", router);
// // Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const io = socketio(server);
chatController(io);




