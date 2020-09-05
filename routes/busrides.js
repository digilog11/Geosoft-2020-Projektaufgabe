const express = require("express");
const router = express.Router();

const Busride = require('../models/Busride');
const User = require('../models/User');

router.post('/register', (req, res) => {
  const { stop, line, destination, departure } = req.body;
  const userId = req.user._id;
  // check if this Busride already exists
  // if yes, add user to busride and busride to user
  Busride.findOne({ start: stop, line: line, destination: destination, departureTime: departure }).then(busride => {
    if(busride){
      // add user to busride
      var users = busride.users;
      // check if busride already registered under user
      for(var i=0; i<users.length; i++){
        if(userId === users[i].toString()){
        }else{
          users.push(userId);
          break;
        }
      }
      busride.users = users;
      busride.save().then(busride => {
        // add busride to user
        User.findById(userId, function (err, user){
          if(err) console.log(err);
          else{
            // check if user already registered busride
            for(var i=0; i<user.busrides.length; i++){
              if(busride._id.equals(user.busrides[i])) {
                req.flash(
                  'successBusride_msg',
                  'Your Busride is now registered'
                );
                res.redirect('/dashboard');
                return;
              }
            }
            var busrides = user.busrides;
            busrides.push(busride._id);
            user.busrides = busrides;
            user.save(err => {
              if(err) console.log(err);
            });
            req.flash(
              'successBusride_msg',
              'Your Busride is now registered'
            );
            res.redirect('/dashboard');
          }
        });
      })
      .catch(err => console.log(err));
    }else{
      // create new busride
      const newBusride = new Busride({ start: stop, line, destination, departureTime: departure, isInfectionRisk: false, users: [userId]});
      newBusride.save().then(busride => {
        // add busride to user
        User.findById(userId, function (err, user){
          if(err) console.log(err);
          else{
            var busrides = user.busrides;
            busrides.push(busride._id);
            user.busrides = busrides;
            user.save(err => {
              if(err) console.log(err);
            });
            req.flash(
              'successBusride_msg',
              'Your Busride is now registered'
            );
            res.redirect('/dashboard');
          }
        });
      })
      .catch(err => console.log(err));
    }
  });
})

module.exports = router;
