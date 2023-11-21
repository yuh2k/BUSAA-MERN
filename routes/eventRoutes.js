const router = require("express").Router();
const eventsController = require("../controllers/eventsController");
const checkLoggedIn = require('../checkLoginStatus');
// Define routes for different actions related to events
router.get('/',  eventsController.index, eventsController.indexView);
router.get('/new', checkLoggedIn, eventsController.new);
router.post('/', checkLoggedIn, eventsController.validateLink, eventsController.create, eventsController.redirectView);
router.get('/:id', eventsController.show, eventsController.showView);
router.get('/:id/edit', checkLoggedIn, eventsController.edit);
router.put('/:id/update', checkLoggedIn, eventsController.update, eventsController.redirectView);
router.delete('/:id/delete', checkLoggedIn, eventsController.delete, eventsController.redirectView);
router.post("/:id/attend", checkLoggedIn, eventsController.attend);
module.exports = router;