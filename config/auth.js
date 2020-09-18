// START code based on Brad Traversy, see https://github.com/bradtraversy/node_passport_login

module.exports = {
  // checks if user has the authentication (is registered as normal user) to view that page
  // if not, user is redirected to user login page with error message displayed
  ensureAuthenticated: function(req, res, next) {
    if (req.user.isUser === true && req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  // checks if user has the authentication (is registered as doctor) to view that page
  // if not, user is redirected to doctor login page with error message displayed
  ensureAuthenticatedDoctor: function(req, res, next) {
    if (req.user.isDoctor === true && req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/doctors/login');
  },
  // if user was already authenticated (has logged in) and tries to view that page
  // normal users are redirected to the user dashboard and doctors to the doctor dashboard
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else if (req.user.isUser === true) {
      res.redirect('/dashboard');
    } else if (req.user.isDoctor === true) {
      res.redirect('/dashboard_doctor');
    }
  }
};

