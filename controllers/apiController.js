const Event = require("../models/event");
const jwt = require("jsonwebtoken");
// Get all upcoming events
const getEvents = async (req, res) => {
  try {
    auth(req, res);
    
    const events = await Event.find({ date: { $gte: new Date() } });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getEvents };