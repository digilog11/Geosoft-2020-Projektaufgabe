// START code based on Brad Traversy, see https://github.com/bradtraversy/node_passport_login

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Load User model
const User = require('../models/User');

// Login Page
router.get("/login", (req, res) => res.render("login_doctor"));

// Register Page
router.get("/register", (req, res) => res.render("register_doctor"));

// Register Handle
router.post('/register', (req, res) => {
  const { name, password, password2 } = req.body;
  let errors = [];
  // check inputs
  if (!name || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  // display error messages
  if (errors.length > 0) {
    res.render('register_doctor', {
      errors,
      name,
      password,
      password2
    });
  } else {
    // search for user with same username in db
    User.findOne({ name: name }).then(user => {
      if (user) {
        // if found display error message
        errors.push({ msg: 'User with that name already exists' });
        res.render('register', {
          errors,
          name,
          password,
          password2
        });
      } else {
        // if not found, create new user in db
        const newUser = new User({ name, password, isUser: false, isDoctor: true});
        // encrypt password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                // display success message and redirect to doctor login page
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/doctors/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard_doctor",
    failureRedirect: "/doctors/login",
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/doctors/login');
});

module.exports = router;
