const express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const User = require('./models').User;
const Course = require('./models').Course;

const authentication = (req, res, next) => {
  const credentials = auth(req);
  if (credentials) {
    User.findOne({emailAddress: credentials.name}).exec((err, user) => {
      try {
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
        console.log(authenticated);
        if (authenticated) {
          console.log(`Authentication successful for user ${user.emailAddress}`);
          req.user = user.emailAddress;
          next();
        } else {
          err.message = `Authentication failure for user ${user.emailAddress}`;
          console.error(err.message);
          next(err);
        }
      } catch(err) {
        err.message = 'Invalid credentials';
        console.error(err);
        next(err);
      }
    });
  } else {
    err.message = 'Auth header not found';
    next(err);
  }
}

// Get info about the authenticated user
router.get('/users', authentication, (req, res, next) => {
  res.json({user: req.user});
});

// error handler
router.use((err, req, res, next) => {
  res.status = err.status || 500;
  res.json({
    error: {
      message: err.message
    }
  });
});

module.exports = router;