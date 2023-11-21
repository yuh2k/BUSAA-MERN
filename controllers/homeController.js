// Render the "about" view
exports.viewAbout = (req, res) => {
  res.render("about", { user: req.user, loggedIn: !!req.user });
};

// Render the "contact" view
exports.viewContact = (req, res) => {
  res.render("contact", { user: req.user, loggedIn: !!req.user });
};


// Render the "index" view
exports.viewIndex = (req, res) => {
  res.render("index", { user: req.user });
};

exports.chat = (req, res) => {
  res.render("chat");
};