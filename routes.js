const express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const User = require('./models').User;
const Course = require('./models').Course;

const authentication = (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  if (credentials) {
    User.findOne({emailAddress: credentials.name}).exec((err, user) => {
      console.log(`Inside if: ${user.emailAddress}`);
      req.user = user.emailAddress;
    });
  } else {
    message = 'Auth header not found';
  }
  console.log(`Outside of if: ${req.user}`);
  
  next();
}

// Get info about the authenticated user
router.get('/users', authentication, (req, res, next) => {
  res.json({user: req.user});
});

module.exports = router;