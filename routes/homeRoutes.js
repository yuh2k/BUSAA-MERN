const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const usersController = require("../controllers/usersController");

// Home routes
router.get("/", homeController.viewIndex);
router.get("/about", homeController.viewAbout);
router.get("/contact", homeController.viewContact);
router.get("/chat", usersController.checkLogin, homeController.viewChat);

module.exports = router;
