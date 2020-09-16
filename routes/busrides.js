const express = require("express");
const router = express.Router();

const Busride = require('../models/Busride');
const User = require('../models/User');

router.post('/register', (req, res) => {
  const { stop, line, destination, departure, tripId, stopLat, stopLon } = req.body;
  const userId = req.user._id;
  // check if this busride already exists
  // if yes, add user to busride and busride to user
  Busride.findOne({ stop: stop, route: line, destination: destination, departureTime: departure }).then(busride => {
    if(busride){
      // add user to busride
      var users = busride.users;
      // check if busride already registered under user
      for(var i=0; i<users.length; i++){
        if(userId == users[i].toString()){
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
      const newBusride = new Busride({
        stop: stop, route: line, destination: destination, departureTime: departure, tripId: tripId,
        stopLon : stopLon, stopLat: stopLat, isInfectionRisk: false, users: [userId]
      });
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

router.post('/markRisk', (req, res) => {
  const { day, month, year, tripId} = req.body;
  // validate inputs
  if( day<1 || day>31 || month<0 || month>12 || year<2020){
    req.flash(
      'errorMarkRisk_msg',
      'Please input a correct Date'
    );
    res.redirect('/dashboard_doctor');
  }
  // find all busrides with that tripId
  else{
    // convert date to unix
    var date = new Date(year, month-1, day).getTime();
    // then time zone conversion
    // because time in db should be the local time of NYC 6 hours need to be added
    date = date + 6*60*60*1000;
    // update all busrides with that tripId and set infection risk to true with "expiration"-date
    Busride.updateMany({tripId: tripId}, {"$set": {isInfectionRisk: true, riskUntil: date}}, (err, result) => {
      if(err) console.log(err);
      else{
        req.flash(
          'successMarkRisk_msg',
          'Busride is now an Infection Risk'
        );
        res.redirect('/dashboard_doctor');
      }
    }
    );
  }
})

router.post('/markUserRisk', (req, res) => {
  const { id, day, month, year } = req.body;
  // convert date to unix
  var date = new Date(year, month-1, day).getTime();
  // then time zone conversion
  // because time in db should be the local time of NYC 6 hours need to be added
  date = date + 6*60*60*1000;
  // validate inputs
  if( day<1 || day>31 || month<0 || month>12 || year<2020){
    req.flash(
      'errorMarkUserRisk_msg',
      'Please input a correct date'
    );
    res.redirect('/dashboard_doctor');
  }else{
    // find user
    User.findById(id, function (err, user){
      if(err) console.log(err);
      else{
        console.log(user);
        // find all busrides of user
        for (var i=0; i<user.busrides.length; i++){
          Busride.findById(user.busrides[i], function (err, busride){
            if(err) console.log(err);
            else{
              // update all busrides with that tripId and set infection risk to true with "expiration"-date
              Busride.updateMany({tripId: busride.tripId}, {"$set": {isInfectionRisk: true, riskUntil: date}}, (err, result) => {
                if(err) console.log(err);
              });
            }
          });
        }
        req.flash(
          'successMarkUserRisk_msg',
          'All busrides of user now an Infection Risk'
        );
        res.redirect('/dashboard_doctor');
      }
    });
  }
})

router.post('/checkInfectionRisks', (req, res) => {
  const {time} = req.body;
  // find all busrides in db
  Busride.find({}, function(err, busrides) {
    if(err) console.log(err);
    else{
      // busrides is an array, but we need a single response object
      // so for each busride in the array search for that busride
      for(var i=0; i<busrides.length;i++){
        Busride.findById(busrides[i]._id, function (err, busride){
          if(err) console.log(err);
          else{
            // if busride in an infection risk but "expiration date" has passed
            // set infection risk to false and "expiration date" to 0
            if(busride.isInfectionRisk && busride.riskUntil < time){
              busride.isInfectionRisk = false;
              busride.riskUntil = 0;
              busride.save(err => {
                if(err) console.log(err);
              });
            }
          }
        });
      }
    }
  });
})

router.get('/user', (req, res) => {
  const userId = req.user._id;
  var busrides = [];
  // find user
  User.findById(userId, async function (err, user){
    if(err) console.log(err);
    else{
      for(var i=0; i<user.busrides.length; i++){
        try{
          // save all busrides of user in array busrides
          var busride = await Busride.findById(user.busrides[i]).exec();
          busrides.push(busride);
        } catch (err){
          console.log(err);
        }
      }
      console.log(busrides);
      // send array busrides as response
      res.json(busrides);
    }
  });
})

router.get('/findAll', (req, res) => {
  // find all busrides in db
  Busride.find({}, function(err, busrides) {
    if(err) console.log(err);
    else{
      // and send them as response
      res.json(busrides);
    }
  });
})

module.exports = router;
