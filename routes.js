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
          req.user = user.emailAddress;
          next();
        } else {
          err.message = `Authentication failure for user ${user.emailAddress}`;
          console.error(err.message);
          res.status(401);
          next(err);
        }
      } catch(err) {
        err.message = 'Invalid credentials';
        console.error(err);
        res.status(401);
        next(err);
      }
    });
  } else {
    err.message = 'Auth header not found';
    res.status(401);
    next(err);
  }
}

// Get info about the authenticated user
router.get('/users', authentication, (req, res, next) => {
  res.json({user: req.user});
});

// create a new user
router.post('/users', [
  check('firstName').isLength({min: 1}),
  check('lastName').isLength({min: 1}),
  check('emailAddress').isEmail(),
  check('password').isLength({min: 5})
], (req, res, next) => {
  // check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors.array());
    res.status(422);
    next(errors.array());
  }
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
  });
});

// error handler
router.use((err, req, res, next) => {
  res.status = err.status || 500;
  let errorObject;
  if (err.message) {
    errorObject = {message: err.message};
  } else {
    errorObject = err;
  }
  res.json({
    error: errorObject
  });
});

module.exports = router;