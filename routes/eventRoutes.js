const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");
const usersController = require("../controllers/usersController");

// Events routes
router.get('/', eventsController.index, eventsController.indexView);
router.get('/new', usersController.checkLogin, eventsController.new);
router.post('/', usersController.checkLogin, eventsController.create, eventsController.redirectView);
router.get('/:id', eventsController.show, eventsController.showView);
router.get('/:id/edit', usersController.checkLogin, eventsController.edit);
router.put('/:id/update', usersController.checkLogin, eventsController.update, eventsController.redirectView);
router.delete('/:id/delete', usersController.checkLogin, eventsController.delete, eventsController.redirectView);
router.post("/:id/attend", usersController.checkLogin, eventsController.attend);

module.exports = router;
