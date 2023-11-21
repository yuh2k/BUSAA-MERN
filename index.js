// Import required modules
const mongoose = require("mongoose");
const express = require('express');
const layouts = require("express-ejs-layouts");
const connectFlash = require('connect-flash');
const methodOverride = require("method-override");
const expressSession = require("express-session");
const passport = require("passport");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const router = require('./routes/index');
const socketio = require("socket.io");
const chatController = require("./controllers/chatController");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/brandeis_saa');

// Middleware configuration
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(layouts);
app.use(cookieParser("secret_passcode"));

// Method override configuration for POST, GET, PUT, DELETE
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET", "PUT", "DELETE"],
  })
);

// Express session configuration
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

// Passport configuration for User authentication
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set global variables for views
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

// Configure app to use JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the routes in the app
app.use('/', router);
// app.use('/users', userRoutes);
// app.use('/events', eventRoutes);
// app.use('/jobs', jobRoutes);


// Start the server

const server = app.listen(PORT, () => {
  console.log("application is running");
});
const io = socketio(server);
chatController(io);