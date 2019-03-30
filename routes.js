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
  check('emailAddress').isEmail(),
  check('password').isLength({min: 5})
], (req, res, next) => {
  console.log(req.body);
  // check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    res.status(422);
    next(errors.array());
  }
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