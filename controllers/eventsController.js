const Event = require("../models/event");
const User = require("../models/user");
const { check, validationResult, isURL } = require("express-validator");
const httpStatus = require("http-status-codes");
const checkLogin = require('../checkLoginStatus');
// Function to extract event parameters from the request body
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
const eventValidationRules = () => {
  return [
    check("title").notEmpty().withMessage("Title is required."),
    check("description").notEmpty().withMessage("Description is required."),
    check("registrationLink")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Registration link must be a valid URL."),
  ];
};
module.exports = {
  // Fetch and display all events
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

  // Render the events index view
  indexView: (req, res) => {
    res.render("events/index", { events: res.locals.events });
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
  // Render the new event form with a list of users
  new: async (req, res) => {
    try {
      const users = await User.find({}); 
      if (!Array.isArray(users)) {
        users = [users];
      }
      res.render("events/new", { users: users }); 
    } catch (error) {
      console.log(`Error fetching users: ${error.message}`);
      res.status(500).send('Internal Server Error');
    }
  },

  // Create a new event and handle success or error scenarios
  create:  (req, res, next) => {
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   const extractedErrors = [];
    //   errors.array().map(err => extractedErrors.push({ [err.param]: err.msg}));
    //   req.flash('error', extractedErrors);
    //   return res.redirect('/events/new');
    // }
    let eventParams = getEventParams(req.body);

    Event.create(eventParams)
      .then((event) => {
        req.flash(
          "success",
          `${event.title} event created successfully!`
        );
        res.locals.redirect = "/events";
        res.locals.event = event;
        next();
      })
      .catch((error) => {
        console.log(`Error saving event: ${error.message}`);
        res.locals.redirect = "/events/new";
        req.flash(
          "error",
          `Failed to create event because: ${error.message}`
        );
        next();
      });
  },
  validateLink: [
    check("registrationLink")
      .isURL()
      .withMessage("Please enter a valid link."),
    (req, res, next) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => err.msg).join(', ');
        req.flash("error", extractedErrors);
        return res.redirect("/events/new");
      }
      next();
    },
  ],
  // Redirect to the appropriate view after an operation
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },


  // Render the event show view
  showView: (req, res) => {
    res.render("events/show");
  },

  // Render the event edit form with the event and user data
  edit: async (req, res, next) => {
    let eventId = req.params.id;
    try {
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

  // Update an event and handle success or error scenarios
  update: async(req, res, next) => {
    try {
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

   // Redirect to the appropriate view after an operation
   redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // Fetch and display a single event
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

  // Render the event show view
  showView: (req, res) => {
    res.render("events/show");
  },

  // Render the event edit form with the event and user data
  edit: async (req, res, next) => {
    let eventId = req.params.id;
    try {
      
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

  // Delete an event and handle success or error scenarios
  delete: (req, res, next) => {
    
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

  // Add a user to the attendees list for an event
  attend: async (req, res, next) => {
    try {
      const eventId = req.params.id;
      const userName = req.body.userName;
      const user = await User.findOne({ name: userName });
  
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
  }
};
