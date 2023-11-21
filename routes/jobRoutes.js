const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const usersController = require("../controllers/usersController");

router.get('/', jobsController.index, jobsController.indexView);
router.get('/new', usersController.checkLogin, jobsController.new);
router.post('/create', usersController.checkLogin, jobsController.create, jobsController.redirectView);
router.get('/:id', jobsController.show, jobsController.showView);
router.get('/:id/edit', usersController.checkLogin, jobsController.edit);
router.put('/:id/update', usersController.checkLogin, jobsController.update, jobsController.redirectView);
router.delete('/:id/delete', usersController.checkLogin, jobsController.delete, jobsController.redirectView);

module.exports = router;
