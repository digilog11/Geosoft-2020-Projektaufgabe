// START code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require('../models/User');

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post('/register', (req, res) => {
  const { name, password, password2 } = req.body;
  let errors = [];
  if (!name || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      password,
      password2
    });
  } else {
    User.findOne({ name: name }).then(user => {
      if (user) {
        errors.push({ msg: 'User with that name already exists' });
        res.render('register', {
          errors,
          name,
          password,
          password2
        });
      } else {
        const newUser = new User({ name, password, isUser: true, isDoctor: false});
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
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
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// END code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login

router.get('/findAll', (req, res) => {
  User.find({}, function(err, users) {
    if(err) console.log(err);
    else{
      res.json(users);
    }
  });
})

module.exports = router;
