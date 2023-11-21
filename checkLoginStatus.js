// Check if the user is already logged in
const checkLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error', 'You must be logged in to view these contents.');
      res.redirect('/users/login');
    } else {
      next();
    }
  };
  
module.exports = checkLoggedIn;