const Job = require("../models/job");// Require the Job model
const { body, validationResult } = require('express-validator'); // Add this line to import the express-validator functions

// Function to extract job parameters from the request body
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

// Validation rules
const jobValidationRules = () => {
  return [
    body("title").notEmpty().withMessage("Job title is required."),
    body("company").notEmpty().withMessage("Company name is required."),
    body("location").notEmpty().withMessage("Location is required."),
    body("description").notEmpty().withMessage("Job description is required."),
    body("requirements").notEmpty().withMessage("Job requirements are required."),
    body("contactEmail").isEmail().withMessage("Contact email must be a valid email."),
    body("contactPhone")
      .optional({ checkFalsy: true })
      .isMobilePhone()
      .withMessage("Contact phone number must be a valid mobile number."),
    body("postDate").isISO8601().withMessage("Post date must be a valid date."),
    body("deadlineDate").isISO8601().withMessage("Deadline date must be a valid date."),

    body("deadlineDate").notEmpty().withMessage("Deadline date is required.")
    .custom((value, { req }) => {
      if (value < req.body.postDate) {
        throw new Error("Post date cannot later than deadline date.");
      }
      return true;
    })
  ];
};


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  req.flash('error', extractedErrors);
  res.redirect(req.originalUrl);
};


// Export an object with controller functions for job-related routes
module.exports = {


  index: (req, res, next) => {
    Job.find({})
      .then((jobs) => {
        res.locals.jobs = jobs;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching jobs: ${error.message}`);
        next(error);
      });
  },

  // Index function to retrieve all jobs
  indexView: (req, res) => {
    
    res.render("jobs/index");
  },

  // Render the job creation page
  new: (req, res) => {
    
    res.render("jobs/new");
  },

  
  // Create a new job
  create: async (req, res, next) => {
    try {
      
      await Promise.all(jobValidationRules().map((rule) => rule.run(req)));
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => err.msg).join(', ');
        req.flash("error", extractedErrors);
        return res.redirect("/jobs/new");
      }

      let jobParams = getJobParams(req.body);

      Job.create(jobParams)
        .then((job) => {
          req.flash("success", `${job.title} position posted successfully!`);
          res.locals.redirect = "/jobs";
          res.locals.job = job;
          next();
        })
        .catch((error) => {
          console.log(`Error saving job: ${error.message}`);
          req.flash("error", `Failed to post job because: ${error.message}`);
          res.locals.redirect = "/jobs/new";
          next();
        });
    } catch (error) {
      console.log(`Error during validation: ${error.message}`);
      next(error);
    }
  },

  // Redirect to the specified redirect path, if any
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // Show a single job by ID
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

  // Render the job detail page
  showView: (req, res) => {
    
    res.render("jobs/show");
  },

  // Render the job edit page
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

  // Update an existing job
  update: async (req, res, next) => {
    try {
      
      await Promise.all(jobValidationRules().map((rule) => rule.run(req)));
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => err.msg).join(', ');
        req.flash("error", extractedErrors);
        return res.redirect(`/jobs/${req.params.id}/edit`);
      }

      let jobId = req.params.id,
        jobParams = getJobParams(req.body);

      Job.findByIdAndUpdate(jobId, {
        $set: jobParams,
      })
        .then((job) => {
          req.flash("success", `${job.title} position updated successfully!`);
          res.locals.redirect = `/jobs/${jobId}`;
          res.locals.job = job;
          next();
        })
        .catch((error) => {
          console.log(`Error updating job by ID: ${error.message}`);
          req.flash("error", `Failed to update job because: ${error.message}`);
          res.locals.redirect = `/jobs/${jobId}/edit`;
          next();
        });
    } catch (error) {
      console.log(`Error during validation: ${error.message}`);
      next(error);
    }
  },

  // Delete the job
  delete: (req, res, next) => {
    
    let jobId = req.params.id;
    Job.findByIdAndRemove(jobId)
      .then(() => {
        res.locals.redirect = "/jobs";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting job by ID: ${error.message}`);
        next();
      });
  },
  
  // Check if the user is already logged in
  checkLogin: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error', 'You must be logged in to access jobs.');
      res.redirect('/users/login');
    } else {
      next();
    }
  },
};