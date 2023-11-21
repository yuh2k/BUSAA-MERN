// Require the User model
const User = require("../models/user");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
// Function to extract user parameters from the request body
const getUserParams = (body) => {
return {
  name: body.name,
  email: body.email,
  password: body.password,
  role: body.role,
  graduationYear: body.graduationYear,
  major: body.major,
  job: body.job,
  company: body.company,
  city: body.city,
  state: body.state,
  country: body.country,
  zipCode: body.zipCode,
  bio: body.bio,
  interests: body.interests,
};
};

// Export an object with controller functions for user-related routes
module.exports = {
index: (req, res, next) => {
  User.find({})
    .then((users) => {
      res.locals.users = users;
      next();
    })
    .catch((error) => {
      console.log(`Error fetching users: ${error.message}`);
      next(error);
    });
},

// Render the users index page
indexView: (req, res) => {
  res.render("users/index");
},

// Render the user creation page
new: (req, res) => {
  res.render("users/new");
},

create: (req, res, next) => {
  if (req.skip) return next();
  const apiToken = crypto.randomBytes(16).toString("hex");
  let newUser = new User(getUserParams(req.body), apiToken);
  User.register(newUser, req.body.password, (error, user) => {
    if (user) {
      req.flash(
        "success",
        `${user.name}'s account created successfully!`
      );
      res.locals.redirect = "/users";
      next();
    } else {
      req.flash(
        "error",
        `Failed to create user account because: ${error.message}.`
      );
      res.locals.redirect = "/users/new";
      next();
    }
  });
},

// Redirect to the specified redirect path, if any
redirectView: (req, res, next) => {
  let redirectPath = res.locals.redirect;
  if (redirectPath) res.redirect(redirectPath);
  else next();
},

// Show a single user by ID
show: (req, res, next) => {
  let userId = req.params.id;
  User.findById(userId)
    .then((user) => {
      if (user) {
        res.locals.user = user;
        next();
      } else {
        req.flash("error", "User not found.");
        res.locals.redirect = "/users";
        next();
      }
    })
    .catch((error) => {
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    });
},

// Render the user detail page
showView: (req, res) => {
  res.render("users/show");
},

// Render the user edit page
edit: (req, res, next) => {
  let userId = req.params.id;
  User.findById(userId)
    .then((user) => {
      res.render("users/edit", {
        user: user,
      });
    })
    .catch((error) => {
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    });
},

// Update a user by ID
update: (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.redirect = `/users/${req.params.id}/edit`;
    return next();
}
  let userId = req.params.id,
    userParams = getUserParams(req.body);
  User.findByIdAndUpdate(userId, {
    $set: userParams,
  })
    .then((user) => {
      req.flash(
          "success",
          `${user.name} account update successfully!`
        );
      res.locals.redirect = `/users/${userId}`;
      res.locals.user = user;
      next();
    })
    .catch((error) => {
      req.flash(
          "failed",
          `${user.name} account update failed!`
        );
      console.log(`Error updating user by ID: ${error.message}`);
      next(error);
    });
},

// Delete a user
delete: (req, res, next) => {
  let userId = req.params.id;
  User.findByIdAndRemove(userId)
    .then(() => {
      res.locals.redirect = "/";
      next();
    })
    .catch((error) => {
      console.log(`Error deleting user by ID: ${error.message}`);
      next();
    });
},

login: (req, res) => {
  res.render('users/login');
},


authenticate: (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log("Error:", err);
      req.flash("error", "An error occurred during authentication.");
      return res.redirect("/users/login");
    }

    if (!user) {
      console.log("Authentication failed:", info.message);
      req.flash("error", "Failed to login.");
      return res.redirect("/users/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.log("Login error:", err);
        req.flash("error", "Failed to login.");
        return res.redirect("/users/login");
      }

      req.flash("success", "Login successful!");
      return res.redirect("/");
    });
  })(req, res, next);
},


validate: [
  body("email").trim().isEmail().withMessage("Email is invalid"),
  body("password").notEmpty().withMessage("Password cannot be empty"),
  body("zipCode")
    .notEmpty()
    .withMessage("Zip code can not be empty")
    .isInt()
    .withMessage("Zip code should be numbers")
    .isLength({ min: 5, max: 5 })
    .withMessage("Zip code should have 5 digits"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let messages = errors.array().map((e) => e.msg);
      req.skip = true;
      req.flash("error", messages.join(" and "));
      res.locals.redirect = "/users/new";
      next();
    } else {
      next();
    }
  },
],


logout: (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out!");
    res.locals.redirect = "/";
    next();
  });
},
verifyToken: (req, res, next) => {
  let token = req.query.apiToken;
  if (token) {
    User.findOne({ apiToken: token })
      .then((user) => {
        if (user) next();
        else next(new Error("Invalid API token."));
      })
      .catch((error) => {
        next(new Error(error.message));
      });
  } else {
    next(new Error("Invalid API token."));
  }
},

};