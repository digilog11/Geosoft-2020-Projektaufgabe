"use_strict";

/**
 * creates markers on map for all busrides, red for infection risks, else green
 * @param {object} request - response from server call
 */
function updateMap (request){
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
    // Leaflet different color markers by: https://github.com/pointhi/leaflet-color-markers
    iconUrl: 'public/marker-icon-red.png',
    shadowUrl: 'public/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // busrides without infection risk have green marker
  var greenIcon = new L.Icon({
    // Leaflet different color markers by: https://github.com/pointhi/leaflet-color-markers
    iconUrl: 'public/marker-icon-green.png',
    shadowUrl: 'public/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // create markers for all busrides
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
function markerOnClick (stop){
  document.getElementById("busrideInfo").innerHTML = "";
  // requests all busrides in database and gives those as a JSON as well as stop
  // on to function printBusrideInfo
  requestJSON("http://localhost:3000/busrides/findAll", printBusrideInfo, stop);
}

/**
 * prints information about busrides taken at this busstop and a form for doctor to mark
 * a busride as an infection risk
 * @param {object} request - response from server call
 * @param {string} stop - name of busstop user clicked on
 */
function printBusrideInfo (request, stop){
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
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='time' name='time' readonly class='form-control-plaintext' value='" + toReadableDate(busrides[i].departureTime) + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='risk'><b>Infection Risk:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='risk' name='risk' readonly class='form-control-plaintext' value='" + busrides[i].isInfectionRisk + "'>" + "</div>" + "</div>"
          + "</div>"
          + "<div class='col-sm-4'>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<label for='riskUntil'><b>Risk until:</b></label>" + "</div>" + "</div>"
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='riskUntil' name='riskUntil' readonly class='form-control-plaintext' value='" + toReadableDate(busrides[i].riskUntil) + "'>" + "</div>" + "</div>"
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
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='time' name='time' readonly class='form-control-plaintext' value='" + toReadableDate(busrides[i].departureTime) + "'>" + "</div>" + "</div>"
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
 * invokes function printUserInfo
 */
function findUser (){
  // requests all users in database and gives those as a JSON
  // on to function printUserInfo
  requestJSON2("http://localhost:3000/users/findAll", printUserInfo);
}

/**
 * searches for specific user and prints form to set all busrides of user as infection risk
 * @param {object} request - response from server call
 */
function printUserInfo (request){
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
      "<div class='alert alert-danger alert-dismissible fade show' role='alert'>No user found</div>";
  }
}

/**
 * creates Leaflet map, sets view on New York City
 */
function initializeMap (){
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
}

/**
 *  updates busrides in db, sets infection risk to false if "expiration date" has passed
 */
function checkBusridesInfectionRisk (){
  var currentTime = new Date().getTime();
  // time zone conversion
  currentTime = currentTime - 6*60*60*1000;
  sendToServer('{"time":"' + currentTime + '"}', "http://localhost:3000/busrides/checkInfectionRisks");
}

//////////////////

initializeMap();

checkBusridesInfectionRisk();

// after a timeout request all busrides from database and give those on to function updateMap
var t = setTimeout(function(){requestJSON2("http://localhost:3000/busrides/findAll", updateMap);}, 1000);
