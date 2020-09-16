// START code based on Brad Traversy, see https://github.com/bradtraversy/node_passport_login

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.user.isUser === true && req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  ensureAuthenticatedDoctor: function(req, res, next) {
    if (req.user.isDoctor === true && req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/doctors/login');
  },
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

