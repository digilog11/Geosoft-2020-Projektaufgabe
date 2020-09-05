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
mongoose.connect('mongodb://localhost/login', {useUnifiedTopology: true, useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

// START code by Brad Traversy, see https://github.com/bradtraversy/node_passport_login
// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

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

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log("Server started on port " + PORT));

// API calls
/**
  * sends an http-get-request to the API for stops near to position
  * and sends it to /nearbyStops/* where it can be used client side
  * @param {object} position - position {lat, lon}
  */
function requestStopsNearby (position){
  var lat = position.latitude;
  var lon = position.longitude;
  var url = "http://bustime.mta.info/api/where/stops-for-location.json?lat=" + lat + "&lon=" + lon + "&radius=200&key=" + key + "";
  console.log(url);
  // start code based on Steve Griffith
  http.get(url, resp =>{
    let data = "";
    resp.on("data", chunk =>{
      data += chunk;
    });
    resp.on("end", () =>{
      let response = JSON.parse(data).data;
      console.log(response);
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
 * and sends it to /monitoringRef=* where it can be used client side
 * @param {object} stopCode - {stopCode}
 */
function requestDepartures (stopCode){
  var monitoringRef = stopCode.stopCode;
  var url = "http://bustime.mta.info/api/siri/stop-monitoring.json?key=" + key + "&OperatorRef=MTA&MonitoringRef=" + monitoringRef;
  console.log(url);
  // start code based on Steve Griffith
  http.get(url, resp =>{
    let data = "";
    resp.on("data", chunk =>{
      data += chunk;
    });
    resp.on("end", () =>{
      let response = JSON.parse(data).Siri;
      console.log(response);
      app.get("/monitoringRef=" + monitoringRef, (req,res) => {
        res.json(response);
      });
    });
  })
  .on("error", err =>{
    console.log("Error: " + err.message);
  });
  // end code based on Steve Griffith
}

//gives user position on to function requestStopsNearby
app.post("/userPosition", (req,res) => {
  var position = req.body;
  console.log(position);
  requestStopsNearby(position);
})

//gives stopCode on to function requestDepartures
app.post("/stopCode", (req,res) => {
  var stopCode = req.body;
  console.log(stopCode);
  requestDepartures(stopCode);
})
