// Require the necessary modules for the router and controllers
const router = require("express").Router(),
    eventsController = require("../controllers/eventsController");
const usersController = require("../controllers/usersController");

// Use the verifyToken middleware from the usersController to verify the user's token
router.use(usersController.verifyToken);

// Set up a route for getting all events and use the index and respondJSON methods from the eventsController
router.get("/events", eventsController.index, eventsController.respondJSON);

// Set up a route for getting a specific event by ID and use the show and respondJSON methods from the eventsController
router.get(
  "/events/:id",
  eventsController.show,
  eventsController.respondJSON      
);

// Use the errorJSON method from the eventsController to handle any errors that may occur
router.use(eventsController.errorJSON);

// Export the router for use in other parts of the application
module.exports = router;
