const router = require("express").Router();
const usersController = require("../controllers/usersController");
// Define routes for different actions related to users
router.get('', usersController.index, usersController.indexView);
router.get('/new', usersController.new);

router.get('/login', usersController.login);
router.post('/login', usersController.authenticate);
router.get('/logout', usersController.logout, usersController.redirectView);
router.delete('/:id/delete', usersController.delete, usersController.redirectView);
router.get('/:id', usersController.show, usersController.showView);
router.get('/:id/edit',  usersController.edit);
router.post('/create', usersController.validate, usersController.create, usersController.redirectView);
router.put('/:id/update', usersController.validate, usersController.update, usersController.redirectView);
module.exports = router;