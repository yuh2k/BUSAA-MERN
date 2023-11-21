const router = require("express").Router();
const homeController = require("../controllers/homeController");
router.get('/', homeController.viewIndex);
router.get('/about', homeController.viewAbout);
router.get('/contact', homeController.viewContact);
router.get('/chat', homeController.chat);
module.exports = router;