// Require the express library and create a router object
const express = require("express");
const router = express.Router();

// Require the different route modules
const homeRoutes = require("./homeRoutes");
const userRoutes = require("./userRoutes");
const eventRoutes = require("./eventRoutes");
const jobRoutes = require("./jobRoutes");
const apiRoutes = require("./apiRoutes");
const errorRoutes = require("./errorRoutes");

// Use the different route modules based on the route prefix
router.use("/", homeRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/jobs", jobRoutes);
router.use("/api", apiRoutes);
router.use("/", errorRoutes);

// Export the router object
module.exports = router;