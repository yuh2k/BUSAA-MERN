// Importing the 'http-status-codes' module
const statusCodes = require("http-status-codes");


// Respond with a 404 error page for resource not found
exports.respondSourceNotFound = (req, res) => {
  let errorCode = statusCodes.NOT_FOUND;
  res.status(errorCode);
  res.render("404");
};

// Respond with a 500 error page for internal server errors
exports.respondInternalError = (error, req, res, next) => {
  let errorCode = statusCodes.INTERNAL_SERVER_ERROR;
  console.log(error);
  res.status(errorCode);
  res.render("500");
  // next(error);
};