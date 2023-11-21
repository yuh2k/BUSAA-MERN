const router = require("express").Router(),
    eventsController = require("../controllers/eventsController");
const usersController = require("../controllers/usersController");

router.use(usersController.verifyToken);

router.get("/events", eventsController.index, eventsController.respondJSON);
router.get(
  "/events/:id",
  eventsController.show,
  eventsController.respondJSON      
);
router.use(eventsController.errorJSON);

module.exports = router;