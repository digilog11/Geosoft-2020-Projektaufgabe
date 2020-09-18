"use_strict";

//////////////////
// API
// used is the MTA Bus Time API
// for documentation go to: http://bustime.mta.info/wiki/Developers/OneBusAwayRESTfulAPI
// to request a key got to: http://bustime.mta.info/wiki/Developers/Index
//////////////////

//// API KEY ////
const key = "YOUR_KEY";

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongodb = require("mongodb");
const mongoose = require('mongoose');
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const http = require("http");

const app = express();

// Passport config
require("./config/passport")(passport);

// DB
mongoose.connect('mongodb://localhost/NYCcovidBusApp', {useUnifiedTopology: true, useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout", "layout_user", "layout_user2", "layout_doctor");

// START code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Express Session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.successBusride_msg = req.flash('successBusride_msg');
  res.locals.errorMarkRisk_msg = req.flash('errorMarkRisk_msg');
  res.locals.successMarkRisk_msg = req.flash('successMarkRisk_msg');
  res.locals.errorMarkUserRisk_msg = req.flash('errorMarkUserRisk_msg');
  res.locals.successMarkUserRisk_msg = req.flash('successMarkUserRisk_msg');
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/doctors", require("./routes/doctors"));
app.use("/busrides", require("./routes/busrides"));

// END code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login

// Make all Files stored in Folder "public" accessible over localhost:3000/public
app.use("/public", express.static(__dirname + "/public"));
// Make all Files stored in Folder "test" accessible over localhost:3000/test
app.use("/test", express.static(__dirname + "/test"));
// Make leaflet library available over localhost:3000/leaflet
app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
// Make jQuery available over localhost:3000/jquery
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));
// Make popper available over localhost:3000/popper
app.use("/popper", express.static(__dirname + "/node_modules/@popperjs/core/dist/umd"));
// Make Bootstrap jQuery plugins available over localhost:3000/bootstrap
app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
// Make Bootstrap's css available over localhost:3000/css
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
// Make qunit library available over localhost:3000/qunit
app.use("/qunit", express.static(__dirname + "/node_modules/qunit/qunit"));

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log("Server started on port " + PORT));

// API calls

/**
  * sends an http-get-request to the API for stops within 200 m of position
  * and sends response as JSON to /nearbyStops/lat=?&lon=? where it can be used client side
  * @param {object} position - position {lat, lon}
  */
function requestStopsNearby (position){
  var lat = position.latitude;
  var lon = position.longitude;
  var url = "http://bustime.mta.info/api/where/stops-for-location.json?lat=" + lat + "&lon=" + lon + "&radius=200&key=" + key + "";
  // start code based on Steve Griffith
  http.get(url, resp =>{
    let data = "";
    resp.on("data", chunk =>{
      data += chunk;
    });
    resp.on("end", () =>{
      let response = JSON.parse(data);
      app.get("/nearbyStops/lat=" + lat + "&lon=" + lon, (req,res) => {
        res.json(response);
      });
    });
  })
  .on("error", err =>{
    console.log("Error: " + err.message);
  });
  // end code based on Steve Griffith
}

/**
 * sends an http-get-request to the API for departures at stop
 * and sends response as JSON to /stopId=? where it can be used client side
 * @param {object} stopId - {stopId}
 */
function requestDepartures (stopId){
  var stopID = stopId.stopId;
  var url = "http://bustime.mta.info/api/where/schedule-for-stop/" + stopID + ".json?key=" + key;
  // start code based on Steve Griffith
  http.get(url, resp =>{
    let data = "";
    resp.on("data", chunk =>{
      data += chunk;
    });
    resp.on("end", () =>{
      let response = JSON.parse(data);
      app.get("/stopId=" + stopID, (req,res) => {
        res.json(response);
      });
    });
  })
  .on("error", err =>{
    console.log("Error: " + err.message);
  });
  // end code based on Steve Griffith
}

// gives user position on to function requestStopsNearby
app.post("/userPosition", (req,res) => {
  var position = req.body;
  requestStopsNearby(position);
})

// gives stopId on to function requestDepartures
app.post("/stopId", (req,res) => {
  var stopId = req.body;
  requestDepartures(stopId);
})
