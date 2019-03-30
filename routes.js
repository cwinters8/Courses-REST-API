const express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const User = require('./models').User;
const Course = require('./models').Course;

const authentication = (req, res, next) => {
  const credentials = auth(req);
  if (credentials) {
    User.findOne({emailAddress: credentials.name}).exec((err, user) => {
      try {
        req.user = user.emailAddress;
        next();
      } catch(err) {
        err.message = 'Credentials not found';
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