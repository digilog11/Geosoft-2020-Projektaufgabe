// START code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, ensureAuthenticatedDoctor } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user,
    layout: "layout_user"
  })
);

router.get('/dashboard2', ensureAuthenticated, (req, res) =>
  res.render('dashboard2', {
    user: req.user,
    layout: "layout_user2"
  })
);

router.get('/dashboard_doctor', ensureAuthenticatedDoctor, (req, res) =>
  res.render('dashboard_doctor', {
    user: req.user,
    layout: "layout_doctor"
  })
);

module.exports = router;
// END code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login
