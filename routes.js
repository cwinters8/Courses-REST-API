const express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const {check, validationResult} = require('express-validator/check');

const User = require('./models').User;
const Course = require('./models').Course;

const authentication = (req, res, next) => {
  const credentials = auth(req);
  if (credentials) {
    User.findOne({emailAddress: credentials.name}).exec((err, user) => {
      try {
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
        if (authenticated) {
          console.log(`Authentication successful for user ${user.emailAddress}`);
          req.user = user;
          next();
        } else {
          err.message = `Authentication failure for user ${user.emailAddress}`;
          console.error(err.message);
          err.status = 401;
          next(err);
        }
      } catch(err) {
        err.message = 'Invalid credentials';
        console.error(err);
        err.status = 401;
        next(err);
      }
    });
  } else {
    const err = {};
    err.message = 'Auth header not found';
    console.error(`error: ${err.message}`);
    err.status = 401;
    next(err);
  }
}

// make sure the user attempting to modify or delete a course owns it
const modifyCourseAuth = (req, res, next) => {
  Course.findById(req.params.id, 'user').exec((err, response) => {
    if (response) {
      if (String(response.user) !== String(req.user._id)) {
        const error = {
          status: 403,
          message: `User does not have permission to modify course ID ${response._id}`
        };
        console.error(error.message);
        next(error);
      } else {
        next();
      }
    } else {
      const error = {
        status: 404,
        message: `Course ID ${req.params.id} does not exist`
      }
      console.error(error.message);
      next(error);
    }
  });
}

// helper function to validate inputs
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors.array());
    errors.status = 400;
    errors.message = errors.array();
    next(errors);
  } else {
    next();
  }
}

// Get info about the authenticated user
router.get('/users', authentication, (req, res) => {
  res.json(req.user);
});

// create a new user
router.post('/users', [
  check('firstName').isLength({min: 1}),
  check('lastName').isLength({min: 1}),
  check('emailAddress').isEmail(),
  check('password').isLength({min: 5})
], validate, (req, res, next) => {
  // add user to database
  const password = bcryptjs.hashSync(req.body.password);
  User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    password: password
  }).then(data => {
    res.status(201);
    res.json(data);
  }).catch(err => {
    err.status = 400;
    console.error(err);
    next(err);
  });
});

// get the full list of courses
router.get('/courses', (req, res) => {
  Course.find().populate('user').then(data => {
    res.json(data);
  });
});

// get an individual course
router.get('/courses/:id', (req, res) => {
  Course.findById(req.params.id).populate('user').then(data => {
    res.json(data);
  });
});

// create a new course
router.post('/courses', authentication, [
  check('title').isLength({min: 1}),
  check('description').isLength({min: 2})
], validate, (req, res) => {
  Course.create({
    user: req.user._id,
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded
  }).then(data => {
    res.location(`/api/courses/${data._id}`);
    res.status(201);
    res.send();
  });
});

// update a course
router.put('/courses/:id', authentication, modifyCourseAuth, [
  check('title').isLength({min: 1}),
  check('description').isLength({min: 2})
], validate, (req, res, next) => {
  Course.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded
  }, (error, response) => {
    if (error) {
      next(error);
    }
    res.status(204);
    res.send();
  });
});

// delete a course
router.delete('/courses/:id', authentication, modifyCourseAuth, (req, res) => {
  Course.findByIdAndDelete(req.params.id, (error, response) => {
    if (error) {
      next(error);
    }
    res.status(204);
    res.send();
  });
});

// error handler
router.use((err, req, res, next) => {
  res.status(err.status || 500);
  let errorObject;
  if (err.message) {
    errorObject = {message: err.message};
  } else if (err) {
    errorObject = err;
  } else {
    errorObject = {message: 'Something went wrong'}
  }
  res.json({
    error: errorObject
  });
});

module.exports = router;