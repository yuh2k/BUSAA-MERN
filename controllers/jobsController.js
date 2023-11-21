// Import Job model
const Job = require("../models/job");
const { check, validationResult } = require("express-validator");
// Helper function to get job parameters from request body
const getJobParams = (body) => {
  return {
    title: body.title,
    company: body.company,
    location: body.location,
    description: body.description,
    requirements: body.requirements,
    salary: body.salary,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    postDate: body.postDate,
    deadlineDate: body.deadlineDate,
    isActive: body.isActive,
  };
};
const jobValidationRules = () => {
  return [
    check("title").notEmpty().withMessage("Title is required."),
    check("company").notEmpty().withMessage("Company name is required."),
    check("location").notEmpty().withMessage("Job location is required."),
    check("description").notEmpty().withMessage("Description is required."),
    check("requirements").notEmpty().withMessage("Requirements are required."),
    check("salary").notEmpty().withMessage("Salary is required."),
    check("contactEmail")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Contact email must be a valid email address."),
    check("contactPhone")
      .optional({ checkFalsy: true })
      .isMobilePhone()
      .withMessage("Contact phone number must be a valid phone number."),
    check("postDate")
      .optional({ checkFalsy: true })
      .isDate()
      .withMessage("Post date must be a valid date."),
    check("deadlineDate")
      .optional({ checkFalsy: true })
      .isDate()
      .withMessage("Deadline date must be a valid date."),
  ];
};

// Define controller methods
module.exports = {
  // Fetch all jobs and save them to res.locals.jobs
  index: (req, res, next) => {
    Job.find({})
      .then((jobs) => {
        res.locals.jobs = jobs;
        res.locals.isUserLoggedIn = req.isAuthenticated(); 
        next();
      })
      .catch((error) => {
        console.log(`Error fetching jobs: ${error.message}`);
        next(error);
      });
  },

  // Render index view
  indexView: (req, res) => {
    
    res.render("jobs/index");
  },

  // Render new job form
  new: (req, res) => {
    
    res.render("jobs/new");
  },

  // Create a new job using request body parameters
  create: (req, res, next) => {
    const errors = validationResult(req);

    
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => err.msg).join(', ');
      req.flash("error", extractedErrors);
      return res.redirect("/events/new");
    }
    let jobParams = getJobParams(req.body);

    Job.create(jobParams)
      .then((job) => {
        req.flash(
          "success",
          `${job.title} was posted successfully!`
        );
        res.locals.redirect = "/jobs/";
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error: ${error.message}`);
        res.locals.redirect = "/jobs/new";
        req.flash(
          "error",
          `Failed because: ${error.message}`
        );
        next(error);
      });
  },

  // Handle redirection
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) {
      res.redirect(redirectPath);
    } else {
      next();
    }
  },

  // Fetch a job by ID and save it to res.locals.job
  show: (req, res, next) => {
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  },

  // Render show view
  showView: (req, res) => {
    
    res.render("jobs/show");
  },

  // Fetch a job by ID and render edit view with the fetched job
  edit: (req, res, next) => {
    
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.render("jobs/edit", {
          job: job,
        });
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    // Get the job ID from the request parameters and the job parameters from the request body
    let jobId = req.params.id,
      jobParams = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        description: req.body.description,
        requirements: req.body.requirements,
        salary: req.body.salary,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        postDate: req.body.postDate,
        deadlineDate: req.body.deadlineDate,
        isActive: req.body.isActive,
      };
    // Use Mongoose's findByIdAndUpdate method to update the job by ID
    Job.findByIdAndUpdate(jobId, {
      $set: jobParams,
    })
      .then((job) => {
        // Set the redirect URL and job object on the response locals object and move to the next middleware
        res.locals.redirect = `/jobs/${jobId}`;
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        // Log any errors and move to the next middleware
        console.log(`Error updating job by ID: ${error.message}`);
        next(error);
      });
  },
  
  delete: (req, res, next) => {
    
    // Get the job ID from the request parameters
    let jobId = req.params.id;
    // Use Mongoose's findByIdAndRemove method to delete the job by ID
    Job.findByIdAndRemove(jobId)
      .then(() => {
        res.locals.redirect = "/jobs";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting job by ID: ${error.message}`);
        next();
      });
  }
  
};