"use_strict";

const express = require("express");
const mongodb = require("mongodb");
const http = require("http");
const port = 3000;

//////////////////
// API
// used is the MTA Bus Time API
// for documentation go to: http://bustime.mta.info/wiki/Developers/OneBusAwayRESTfulAPI
// to request a key got to: http://bustime.mta.info/wiki/Developers/Index
//////////////////

//// API KEY ////
const key = "YOUR_KEY";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * function which creates a Connection to MongoDB and the collections users, doctors and rides.
 * Retries every 3 seconds if no connection could be established.
 */
async function connectMongoDB() {
  try{
    // connect to database server
    app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://localhost:27017",
    {useUnifiedTopology: true, useNewUrlParser: true});
    // connect do database "geosoft"
    app.locals.db = await app.locals.dbConnection.db("geosoft");
    console.log("Using db: " + app.locals.db.databaseName);
    // create collection
    try{
      app.locals.db.createCollection("users");
      console.log("Collection users created");
      app.locals.db.createCollection("doctors");
      console.log("Collection doctors created");
      app.locals.db.createCollection("rides");
      console.log("Collection rides created");
    }
    catch (error){
      console.dir(error);
      setTimeout(connectMongoDB, 3000);
    }
  }
  catch (error){
    console.dir(error);
    setTimeout(connectMongoDB, 3000);
  }
}

//Start connecting
connectMongoDB();

/**
 * inserts a document into the MongoDB collection users
 * @param {object} user - user {username, password}
 */
 function insertUserMongo (user) {
    app.locals.db.collection("users").insertOne(user, (error, result) => {
     if (error){
        console.dir(error);
      }
      console.log("1 document inserted in collection users");
    });
 }

 /**
  * inserts a document into the MongoDB collection doctors
  * @param {object} doctor - doctor {username, password}
  */
  function insertDoctorMongo (doctor) {
     app.locals.db.collection("doctors").insertOne(doctor, (error, result) => {
      if (error){
         console.dir(error);
       }
       console.log("1 document inserted in collection doctors");
     });
  }

  /**
   * sends an http-get-request to the API for stops near to position
   * and sends it to /nearbyStops/* where it can be used client side
   * @param {object} position - position {lat, lon}
   */
  function requestStopsNearby (position){
    var lat = position.latitude;
    var lon = position.longitude;
    var url = "http://bustime.mta.info/api/where/stops-for-location.json?lat=" + lat + "&lon=" + lon + "&radius=1000&key=" + key + "";
    console.log(url);
    // start code @ Steve Griffith
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
    // end code @ Steve Griffith
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
    // start code @ Steve Griffith
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
    // end code @ Steve Griffith
  }

// Make all Files stored in Folder "public" accessible over localhost:3000/public
app.use("/public", express.static(__dirname + "/public"));

// Make leaflet library available over localhost:3000/leaflet
app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));

// Send startpage.html on request to "/"
app.get("/", (req,res) => {
  res.sendFile(__dirname + "/startpage.html")
});

// Send user.html on request to "/user"
app.get("/user", (req,res) => {
  res.sendFile(__dirname + "/user.html")
});

// Send doctor.html on request to "/doctor"
app.get("/doctor", (req,res) => {
  res.sendFile(__dirname + "/doctor.html")
});

//takes request body from userCreated-Post-Request and gives it on to function
//insertUserMongo()
app.post("/userCreated", (req,res) => {
  var user = req.body;
  insertUserMongo(user);
})

//takes request body from doctorCreated-Post-Request and gives it on to function
//insertDoctorMongo()
app.post("/doctorCreated", (req,res) => {
  var user = req.body;
  insertDoctorMongo(user);
})

//gives user position on to function requestStopsNearby
app.post("/userPosition", (req,res) => {
  var position = req.body;
  requestStopsNearby(position);
})

//gives stopCode on to function requestDepartures
app.post("/stopCode", (req,res) => {
  var stopCode = req.body;
  console.log(stopCode);
  requestDepartures(stopCode);
})

// Returns all documents stored in collection users
app.get("/users", (req,res) => {
  app.locals.db.collection("users").find({}).toArray((error, result) => {
    if (error){
      console.dir(error);
    }
    res.json(result);
  });
});

// Returns all documents stored in collection doctors
app.get("/doctors", (req,res) => {
  app.locals.db.collection("doctors").find({}).toArray((error, result) => {
    if (error){
      console.dir(error);
    }
    res.json(result);
  });
});

// listen on port 3000
app.listen(port,
  () => console.log("app listening at http://localhost:3000")
);
