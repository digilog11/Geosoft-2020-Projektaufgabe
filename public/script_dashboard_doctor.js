/**
 * sends object to destination via POST-Request
 * @param {object} object - JSON object
 * @param {string} destination - destination address
 */
function sendToServer(object, destination){
  var xhr = new window.XMLHttpRequest();
  xhr.open("POST", destination, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(object);
}

/**
 * uses xhr to request a JSON from an url and after success invokes a function
 * @param {string} url - url from which to request the JSON
 * @param {string} cFunction - name of function to be called after request is ready
 */
function requestJSON (url, cFunction) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function(){
     if(request.readyState == 4 && request.status == "200"){
       cFunction(this);
     }
   };
   request.open("GET", url, true);
   request.send();
}

/**
 * uses xhr to request a JSON from an url and after success invokes a function
 * @param {string} url - url from which to request the JSON
 * @param {string} cFunction - name of function to be called after request is ready
 * @param {object} object - parameter of cFunction
 */
function requestJSON2 (url, cFunction, object) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function(){
     if(request.readyState == 4 && request.status == "200"){
       cFunction(this, object);
     }
   };
   request.open("GET", url, true);
   request.send();
}

/**
 * creates markers on map for all busrides, red for infection risks, else green
 * @param {object} request - response from server call
 */
function updateMap(request){
  var busrides = JSON.parse(request.response);

  // create baselayer
  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:18,
    attribution: 'Leaflet, OpenStreetMap Contributors',
  });

  // empty map div in case it has already been initialized
  document.getElementById("mapContainer").innerHTML ="<div id='mapId' style='height: 500px;'></div>";

  // create a Leaflet map, center is NYC
  var map = L.map('mapId').setView([40.730610,-73.935242],10);
  osm.addTo(map);

  // busrides with infection risk have red marker
  var redIcon = new L.Icon({
    iconUrl: 'public/marker-icon-red.png',
    shadowUrl: 'public/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // busrides without infection risk have green marker
  var greenIcon = new L.Icon({
    iconUrl: 'public/marker-icon-green.png',
    shadowUrl: 'public/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // create markers
  for(var i=0; i < busrides.length; i++){
    if(busrides[i].isInfectionRisk){
      L.marker([busrides[i].stopLat, busrides[i].stopLon], {icon: redIcon, title: busrides[i].stop})
        .bindPopup("<p>" + busrides[i].stop + "</p>")
        // when user clicks on marker function markerOnClick is invoked
        .on("click", function(){markerOnClick(this.options.title);})
        .addTo(map);
    } else {
      L.marker([busrides[i].stopLat, busrides[i].stopLon], {icon: greenIcon, title: busrides[i].stop})
        .bindPopup("<p>" + busrides[i].stop + "</p>")
        // when user clicks on marker function markerOnClick is invoked
        .on("click", function(){markerOnClick(this.options.title);})
        .addTo(map);
    }
  };
}

/**
 * invokes function printBusrideInfo
 * @param {string} stop - name of busstop user clicked on
 */
function markerOnClick(stop){
  document.getElementById("busrideInfo").innerHTML = "";
  requestJSON2("http://localhost:3000/busrides/findAll", printBusrideInfo, stop);
}

/**
 * prints information about busrides taken at this busstop and a form for doctor to mark
 * a busride as an infection risk
 * @param {object} request - response from server call
 * @param {string} stop - name of busstop user clicked on
 */
function printBusrideInfo(request, stop){
  var busrides = JSON.parse(request.response);
  // print busstop name
  document.getElementById("busrideInfo").innerHTML += "<h4 class='bg-dark text-white text-center'>"
    + stop + "</h4>";
  // search for bussrides corresponding to that busstop
  for(var i=0; i < busrides.length; i++){
    if(stop == busrides[i].stop){
      // print form with information about busride and input fields for day, month and year
      // with this form a doctor can mark a single busride as infection risk for a time period
      if(busrides[i].isInfectionRisk){
        document.getElementById("busrideInfo").innerHTML +=
          "<div class='container-fluid bg-light mb-2'><form action='/busrides/markRisk' method='POST'>"
          + "<div class='row'>"
          + "<div class='col-sm-3'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='line'><b>Route:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='line' name='line' readonly class='form-control-plaintext' value='" + busrides[i].route + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-9'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='destination'><b>Destination:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='destination' name='destination' readonly class='form-control-plaintext' value='" + busrides[i].destination + "'>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='departure'><b>Departure:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='time' name='time' readonly class='form-control-plaintext' value='" + toreadableDate(busrides[i].departureTime) + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='risk'><b>Infection Risk:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='risk' name='risk' readonly class='form-control-plaintext' value='" + busrides[i].isInfectionRisk + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='riskUntil'><b>Risk until:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='riskUntil' name='riskUntil' readonly class='form-control-plaintext' value='" + toreadableDate(busrides[i].riskUntil) + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-0'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='id' name='id' readonly class='form-control-plaintext' value='" + busrides[i]._id + "'>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='tripId' name='tripId' readonly class='form-control-plaintext' value='" + busrides[i].tripId + "'>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-12'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label><b>Infection Risk until:</b></label>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='day'><b>Day:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='1' max='31' id='day' name='day' class='form-control' placeholde='day'/>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='month'><b>Month:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='1' max='12' id='month' name='month' class='form-control' placeholde='month'/>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='year'><b>Year:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='2020' max='2021' id='year' name='year' class='form-control' placeholde='year'/>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-12 my-auto text-center'>" + "<button type='submit' class='btn btn-secondary mt-2 mb-2'>Mark as Infection Risk</button>" + "</div>"
          + "</div>"
          + "</form></div>";
      }else{
        document.getElementById("busrideInfo").innerHTML +=
          "<div class='container-fluid bg-light mb-2'><form action='/busrides/markRisk' method='POST'>"
          + "<div class='row'>"
          + "<div class='col-sm-3'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='line'><b>Route:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='line' name='line' readonly class='form-control-plaintext' value='" + busrides[i].route + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-9'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='destination'><b>Destination:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='destination' name='destination' readonly class='form-control-plaintext' value='" + busrides[i].destination + "'>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-6'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='departure'><b>Departure:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='time' name='time' readonly class='form-control-plaintext' value='" + toreadableDate(busrides[i].departureTime) + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-6'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='risk'><b>Infection Risk:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='risk' name='risk' readonly class='form-control-plaintext' value='" + busrides[i].isInfectionRisk + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-0'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='id' name='id' readonly class='form-control-plaintext' value='" + busrides[i]._id + "'>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='tripId' name='tripId' readonly class='form-control-plaintext' value='" + busrides[i].tripId + "'>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-12'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label><b>Infection Risk until:</b></label>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='day'><b>Day:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='1' max='31' id='day' name='day' class='form-control' placeholde='day'/>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='month'><b>Month:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='1' max='12' id='month' name='month' class='form-control' placeholde='month'/>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='year'><b>Year:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='2020' max='2021' id='year' name='year' class='form-control' placeholde='year'/>" + "</div>" + "</div>"
          + "</div>"
          + "</div>"
          + "<div class='row'>"
          + "<div class='col-sm-12 my-auto text-center'>" + "<button type='submit' class='btn btn-secondary mt-2 mb-2'>Mark as Infection Risk</button>" + "</div>"
          + "</div>"
          + "</form></div>";
      }
    }
  }
}

/**
 * converts unix milliseconds to a human-readable time string and considers
 * time zone conversion from testing time zone (CEST) to application time zone (EDT)
 * @param {number} unix - time in unix milliseconds
 * @return {string} - readable date + time string eg. "Wed Sep 09 2020 11:46"
 */
function toreadableDate(unix){
  // since the Date() function automatically converts to the PCs local time
  // time zone conversion between testing zone (Germany) and application zone (NYC) is needed
  // Germany is currently six hours ahead, so those are subracted from unix
  var unixTimezoneConversion = unix - 6*60*60*1000;
  var date = new Date(unixTimezoneConversion);
  var string = date.toString();
  return string.substr(0,21);
}

/**
 * invokes function printUserInfo
 */
function findUser(){
  requestJSON("http://localhost:3000/users/findAll", printUserInfo);
}

/**
 * searches for specific user and prints form to set all busrides of user as infection risk
 * @param {object} request - response from server call
 */
function printUserInfo(request){
  document.getElementById("foundUser").innerHTML = "";
  var users = JSON.parse(request.response);
  var userToFind = document.getElementById("userToFind").value;
  var userFound = false;
  // search for userToFind
  for (var i=0; i<users.length; i++){
    if(userToFind == users[i].name && users[i].isUser == true){
      // if user found print form with input fields day, month, year
      // so doctor can set all busrides of user to infection risk for a time period
      userFound = true;
      document.getElementById("foundUser").innerHTML =
        "<h4 class='bg-dark text-white text-center'>User found: "+ users[i].name + "</h4>"
        +"<div class='container-fluid bg-light mb-2'>"
        + "<form action='/busrides/markUserRisk' method='POST'>"
        + "<div class='row'>"
        + "<div class='col-sm-12'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<label><b>Infection Risk until:</b></label>" + "</div>" + "</div>"
        + "</div>"
        + "</div>"
        + "<div class='row '>"
        + "<div class='col-sm-2'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<label for='day'><b>Day:</b></label>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='1' max='31' id='day' name='day' class='form-control mb-2' placeholde='day'/>" + "</div>" + "</div>"
        + "</div>"
        + "<div class='col-sm-2'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<label for='month'><b>Month:</b></label>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='1' max='12' id='month' name='month' class='form-control mb-2' placeholde='month'/>" + "</div>" + "</div>"
        + "</div>"
        + "<div class='col-sm-2'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<label for='year'><b>Year:</b></label>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='number' min='2020' max='2021' id='year' name='year' class='form-control mb-2' placeholde='year'/>" + "</div>" + "</div>"
        + "</div>"
        + "<div class='col-sm-0'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='id' name='id' readonly class='form-control-plaintext' value='" + users[i]._id + "'>" + "</div>" + "</div>"
        + "</div>"
        + "<div class='col-sm-6 my-auto text-center'>" + "<button type='submit' class='btn btn-secondary mt-2 mb-2'>Mark all busrides of user as Infection Risk</button>" + "</div>"
        + "</div></form></div>";
    }
  }
  // if user not found print error message
  if (!userFound){
    document.getElementById("foundUser").innerHTML =
      "<div class='alert alert-danger' role='alert'>No user found</div>";
  }
}

//////////////////
// initialize map
//////////////////

// create baselayer
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:18,
  attribution: 'Leaflet, OpenStreetMap Contributors',
});

// empty map div in case it has already been initialized
document.getElementById("mapContainer").innerHTML ="<div id='mapId' style='height: 500px;'></div>";

// create a Leaflet map, center is NYC
var map = L.map('mapId').setView([40.730610,-73.935242],10);
osm.addTo(map);

//////////////////
// update busrides in db, set infection risk to false if "expiration date" has passed
var currentTime = new Date().getTime();
// time zone conversion
currentTime = currentTime - 6*60*60*1000;
sendToServer('{"time":"' + currentTime + '"}', "http://localhost:3000/busrides/checkInfectionRisks");

// request all busrides from Server and invoke function updateMap
requestJSON("http://localhost:3000/busrides/findAll", updateMap);
