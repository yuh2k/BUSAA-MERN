const router = require("express").Router();
const jobsController = require("../controllers/jobsController");
const checkLoggedIn = require('../checkLoginStatus');
// Define routes for different actions related to jobs
router.get('/', jobsController.index, jobsController.indexView);
router.get('/new', checkLoggedIn, jobsController.new);
router.post('/create', checkLoggedIn, jobsController.create, jobsController.redirectView);
router.get('/:id', jobsController.show, jobsController.showView);
router.get('/:id/edit', checkLoggedIn, jobsController.edit);
router.put('/:id/update', checkLoggedIn, jobsController.update, jobsController.redirectView);
router.delete('/:id/delete', checkLoggedIn, jobsController.delete, jobsController.redirectView);
module.exports = router;
