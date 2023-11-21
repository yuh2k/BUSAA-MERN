// Import the Mongoose library
const mongoose = require('mongoose');

// Define the event schema
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isOnline: { type: Boolean, default: false },
    registrationLink: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Create the Event model from the schema and export it
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;