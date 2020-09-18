// START code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login

const express = require('express');
const router = express.Router();
var path = require('path');
const { ensureAuthenticated, forwardAuthenticated, ensureAuthenticatedDoctor } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard User
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user,
    layout: "layout_user"
  })
);

// END code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login

// Dashboard 2 User
router.get('/dashboard2', ensureAuthenticated, (req, res) =>
  res.render('dashboard2', {
    user: req.user,
    layout: "layout_user2"
  })
);

// Dashboard Doctor
router.get('/dashboard_doctor', ensureAuthenticatedDoctor, (req, res) =>
  res.render('dashboard_doctor', {
    user: req.user,
    layout: "layout_doctor"
  })
);

// QUnit Test
router.get('/test', (req, res) =>
  res.sendFile(path.join(__dirname, '../test/test.html'))
);

module.exports = router;
