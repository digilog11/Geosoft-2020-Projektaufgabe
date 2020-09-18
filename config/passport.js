// START code based on Brad Traversy, see https://github.com/bradtraversy/node_passport_login

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load model
const User = require('../models/User');

// User login
module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'name' }, (name, password, done) => {
      // find user in database with the same name as login form name
      User.findOne({
        name: name
      }).then(user => {
        // if no user found display error message
        if (!user) {
          return done(null, false, { message: 'No user with that name registered' });
        }
        // if user found compare login form password with password in database
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          // if password matched login successful
          if (isMatch) {
            return done(null, user);
          // if not display error message
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
