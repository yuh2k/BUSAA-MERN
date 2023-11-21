// Require necessary models
const Event = require("../models/event");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const httpStatus = require("http-status-codes");

// Get event parameters from request body
const getEventParams = (body) => {
  return {
    title: body.title,
    description: body.description,
    location: body.location,
    startDate: body.startDate,
    endDate: body.endDate,
    isOnline: body.isOnline,
    registrationLink: body.registrationLink,
    organizer: body.organizer,
    attendees: body.attendees,
  };
};

// Validation rules
const eventValidationRules = () => {
  return [
    check("title").notEmpty().withMessage("Title is required."),
    check("description").notEmpty().withMessage("Description is required."),
    check("registrationLink")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Registration link must be a valid URL."),
    check("endDate").notEmpty().withMessage("End date is required.")
    .custom((value, { req }) => {
      if (value < req.body.startDate) {
        throw new Error("Start date cannot later than end date.");
      }
      return true;
    })
  ];
};

// Check if the user is already logged in
const checkLogin = (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in to access jobs.');
    res.redirect('/users/login');
    return false;
  }
  return true;
};

// Define event controller methods
module.exports = {
  // List all events
  index: (req, res, next) => {
    Event.find({})
      .populate("organizer attendees")
      .then((events) => {
        res.locals.events = events;
        res.locals.isUserLoggedIn = req.isAuthenticated(); 
        next();
      })
      .catch((error) => {
        console.log(`Error fetching events: ${error.message}`);
        next(error);
      });
  },

  // Render event index view
  indexView: (req, res) => {
    res.render("events/index");
  },

  // Render new event form
  new: async (req, res) => {
    try {
      if (!checkLogin(req, res)) return;

      let users = await User.find({});
      if (!Array.isArray(users)) {
        users = [users];
      }
      res.render("events/new", { users: users }); 
    } catch (error) {
      console.log(`Error fetching users: ${error.message}`);
      res.status(500).send('Internal Server Error');
    }
  },

  // Create a new event
  create: async (req, res, next) => {
    try {
      if (!checkLogin(req, res)) return;
      await Promise.all(eventValidationRules().map((rule) => rule.run(req)));
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => err.msg).join(', ');
        req.flash("error", extractedErrors);
        return res.redirect("/events/new");
      }
  

      let eventParams = getEventParams(req.body);
      Event.create(eventParams)
        .then((event) => {
          req.flash("success", `${event.title} event created successfully!`);
          res.locals.redirect = "/events";
          res.locals.event = event;
          next();
        })
        .catch((error) => {
          console.log(`Error saving event: ${error.message}`);
          res.locals.redirect = "/events/new";
          req.flash("error", `Failed to create event because: ${error.message}`);
          next();
        });
    } catch (error) {
      console.log(`Error during validation: ${error.message}`);
      next(error);
    }
  },

  

  // Redirect to specified URL
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // Show a single event
  show: (req, res, next) => {
    let eventId = req.params.id;
    Event.findById(eventId)
      .populate("organizer attendees")
      .then((event) => {
        res.locals.event = event;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching event by ID: ${error.message}`);
        next(error);
      });
  },

  // Render event detail view
  showView: (req, res) => {
    res.render("events/show");
  },

  // Render edit event form
  edit: async (req, res, next) => {
    let eventId = req.params.id;
    try {
      if (!checkLogin(req, res)) return;
      const event = await Event.findById(eventId);
      const users = await User.find({});
      res.render("events/edit", {
        event: event,
        users: users,
      });
    } catch (error) {
      console.log(`Error fetching event or users by ID: ${error.message}`);
      next(error);
    }
  },
  
  // Update an existing event
  update: async (req, res, next) => {
    try {
      if (!checkLogin(req, res)) return;
      await Promise.all(eventValidationRules().map((rule) => rule.run(req)));
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => err.msg).join(', ');
        req.flash("error", extractedErrors);
        return res.redirect(`/events/${req.params.id}/edit`);
      }

      let eventId = req.params.id,
        eventParams = {
          title: req.body.title,
          description: req.body.description,
          location: req.body.location,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          isOnline: req.body.isOnline,
          registrationLink: req.body.registrationLink,
          organizer: req.body.organizer,
          attendees: req.body.attendees,
        };

      Event.findByIdAndUpdate(eventId, {
        $set: eventParams,
      })
        .then((event) => {
          req.flash("success", `${event.title} event updated successfully!`);
          res.locals.redirect = `/events/${eventId}`;
          res.locals.event = event;
          next();
        })
        .catch((error) => {
          console.log(`Error updating event by ID: ${error.message}`);
          req.flash("error", `Failed to update event because: ${error.message}`);
          res.locals.redirect = `/events/${eventId}/edit`;
          next();
        });
    } catch (error) {
      console.log(`Error during validation: ${error.message}`);
      next(error);
    }
  },


  // Delete an existing event
  delete: (req, res, next) => {
    if (!checkLogin(req, res)) return;
    let eventId = req.params.id;
    Event.findByIdAndRemove(eventId)
      .then(() => {
        req.flash(
            "success",
            "Event deleted successfully!"
        );
        res.locals.redirect = "/events";
        next();
    })
      .catch((error) => {
        console.log(`Error deleting event by ID: ${error.message}`);
        req.flash(
        "error",
        "Failed to delete event!"
        );
      next();
    });
  },

  // Add a user to the attendees list of an event
  attend: async (req, res) => {
    if (!checkLogin(req, res)) return;
    try {
      const eventId = req.params.id;
      const userName = req.body.userName;
      const user = await User.findOne({ name: userName });
      if (!checkLogin(req, res)) {
        return;
      }
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
  
      const event = await Event.findById(eventId);
      if (!event.attendees.includes(user._id)) {
        event.attendees.push(user);
        await event.save();
      }
  
      res.status(200).send("User successfully added to attendees");
    } catch (error) {
      console.log(`Error attending event: ${error.message}`);
      res.status(500).send("Internal Server Error");
    }
  },

  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals,
    });
  },

  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error.",
      };
    }
    res.json(errorObject);
  },
};
    

