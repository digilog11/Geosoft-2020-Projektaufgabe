"use_strict";

/**
 * gets the current position of user and gives it on to function geolocationUserPositionMap
 */
function loadCurrentPosition () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geolocationUserPositionMap);
  } else {
    alert("Geolocation is not supported by this browser");
  }
}

/**
 * sends user position to server to request stops near user position from the API
 * after a timeout (to make sure response from API has been received) requests the server
 * for the API response and gives it on to and invokes function userPositionMap
 * @param {object} geolocation - calculated by loadCurrentPosition function
 */
function geolocationUserPositionMap (geolocation){
  document.getElementById("stopInfo").innerHTML = "";
  var lat = geolocation.coords.latitude;
  var lon = geolocation.coords.longitude;
  var position = '{"latitude":' + lat + ', "longitude":' + lon + '}';
  // send user position to server
  sendToServer(position, "http://localhost:3000/userPosition");
  // invoke function userPositionMap after timeout
  var t = setTimeout(function(){requestJSON("http://localhost:3000/nearbyStops/lat=" + lat + "&lon=" + lon,
    userPositionMap, geolocation);}, 2000);
}

/**
 * sends position of point user clicked on to server to request stops near this position from the API
 * after a timeout (to make sure response from API has been received) requests the server
 * for the API response and gives it on to and invokes function userPositionMap
 */
function manualUserPositionMap2 (lat, lon){
  document.getElementById("stopInfo").innerHTML = "";
  var position = '{"latitude":' + lat + ', "longitude":' + lon + '}';
  // send user position to server
  sendToServer(position, "http://localhost:3000/userPosition");
  position = {"coords": {"latitude": lat , "longitude": lon }};
  // invoke function userPositionMap after timeout
  var t = setTimeout(function(){requestJSON("http://localhost:3000/nearbyStops/lat=" + lat + "&lon=" + lon,
    userPositionMap, position);}, 2000);
}

/**
 * centers the map on user position and creates marker for user position and stops near it
 * @param {object} request - XMLHttpRequest
 * @param {object} position - user position
 */
function userPositionMap (request, position) {
  var stops = JSON.parse(request.response);
  var point = {"lat": position.coords.latitude, "lon": position.coords.longitude};

  // create baselayer
  var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:18,
    attribution: 'Leaflet, OpenStreetMap Contributors',
  });

  // empty map div in case it has already been initialized
  document.getElementById("mapContainer").innerHTML ="<div id='mapId' style='height: 500px;'></div>";

  // create a Leaflet map, center is position of user
  var map = L.map('mapId').setView([point.lat,point.lon],16);
  osm.addTo(map);

  // when user clicks somewhere on map that position is given on to function manualUserPositionMap2
  map.on("click", function (e){
    manualUserPositionMap2(e.latlng.lat, e.latlng.lng);
  })

  // marker with user position is gold
  var goldIcon = new L.Icon({
    // Leaflet different color markers by: https://github.com/pointhi/leaflet-color-markers
    iconUrl: 'public/marker-icon-gold.png',
    shadowUrl: 'public/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // add a marker at the position of user
  L.marker([point.lat,point.lon], {icon: goldIcon, title: "Your position"}).addTo(map).bindPopup("Your position").openPopup();

  if (stops.data.stops.length == 0){
    // if no stops nearby display error message
    document.getElementById("mapError-Container").innerHTML =
      "<div class='alert alert-danger alert-dismissible fade show' role='alert'>No stops within 200 m</div>";
  }else{
    document.getElementById("mapError-Container").innerHTML = "";
    // for all stops create a marker and popup with name of stop
    for(var i = 0; i < stops.data.stops.length; i++){
      L.marker(
        [stops.data.stops[i].lat, stops.data.stops[i].lon], {title: stops.data.stops[i].id})
      .bindPopup("<p>" + stops.data.stops[i].name + "</p>")
      // when user clicks on marker function markerOnClick is invoked
      .on("click", function(){markerOnClick(this.options.title);})
      .addTo(map);
    };
  }
}

/**
 * sends the stopId to the server for it to request current departures at this stop from API,
 * invokes function printCurrentDepartures after timeout
 * @param {string} stopId - id of stop
 */
function markerOnClick (stopId){
  document.getElementById("stopInfo").innerHTML = "";
  // send stopId to server
  sendToServer('{"stopId":"' + stopId + '"}', "http://localhost:3000/stopId");
  // invoke function printCurrentDepartures after timeout
  var t = setTimeout(function(){
    requestJSON("http://localhost:3000/stopId=" + stopId, printCurrentDepartures, stopId);
  }, 3000);
}

/**
 * prints current departures at stop
 * @param {object} request - XMLHttpRequest
 * @param {object} stopId - stopId
 */
function printCurrentDepartures (request, stopId){
  var departures = JSON.parse(request.response);
  // print stop name
  document.getElementById("stopInfo").innerHTML += "<h4 class='bg-dark text-white text-center'>"
    + departures.data.references.stops[0].name + "</h4>";
  // departures consist of a schedule for the busstop for the whole day
  // compare with current time and only display departures within -5 to +20 minutes of current time
  // save these in currentDepartures
  var currentDepartures = [];
  // 5 minutes before currentTime = - 5*60*1000 (milliseconds)
  var minCurrentTime = departures.currentTime - 5*60*1000;
  // 20 minutes after currentTime = + 20*60*1000 (milliseconds)
  var maxCurrentTime = departures.currentTime + 20*60*1000;
  // search for departures within that time frame
  for(var i = 0; i < departures.data.entry.stopRouteSchedules[0].stopRouteDirectionSchedules[0].scheduleStopTimes.length; i++){
    if(departures.data.entry.stopRouteSchedules[0].stopRouteDirectionSchedules[0].scheduleStopTimes[i].departureTime >= minCurrentTime
    && departures.data.entry.stopRouteSchedules[0].stopRouteDirectionSchedules[0].scheduleStopTimes[i].departureTime <= maxCurrentTime){
      currentDepartures.push({
        "stop": departures.data.references.stops[0].name,
        "stopLat": departures.data.references.stops[0].lat,
        "stopLon": departures.data.references.stops[0].lon,
        "departure": departures.data.entry.stopRouteSchedules[0].stopRouteDirectionSchedules[0].scheduleStopTimes[i].departureTime,
        "tripId": departures.data.entry.stopRouteSchedules[0].stopRouteDirectionSchedules[0].scheduleStopTimes[i].tripId,
        "destination": departures.data.entry.stopRouteSchedules[0].stopRouteDirectionSchedules[0].tripHeadsign,
        "routeId": departures.data.entry.stopRouteSchedules[0].routeId
      });
    }
  }
  // if no current departures print message
  if (currentDepartures.length == 0){
    document.getElementById("stopInfo").innerHTML += "<div class='container-fluid bg-light'> <p>No current departures</p> </div>";
  }
  // else print information about current busrides and form for user to
  // register these busrides in db if user wants to take that busride
  for (var i = 0; i < currentDepartures.length; i++){
      document.getElementById("stopInfo").innerHTML +=
        "<div class='container-fluid bg-light mb-2'><form action='/busrides/register' method='POST'>"
        + "<div class='row'>"
        + "<div class='col-sm-3'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<label for='line'><b>Route:</b></label>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='line' name='line' readonly class='form-control-plaintext' value='" + currentDepartures[i].routeId + "'>" + "</div>" + "</div>"
        + "</div>"
        + "<div class='col-sm-9'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<label for='destination'><b>Destination:</b></label>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='destination' name='destination' readonly class='form-control-plaintext' value='" + currentDepartures[i].destination + "'>" + "</div>" + "</div>"
        + "</div>"
        + "</div>"
        + "<div class='row'>"
        + "<div class='col-sm-3'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<label for='departure'><b>Departure:</b></label>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='time' name='time' readonly class='form-control-plaintext' value='" + toReadableTime(currentDepartures[i].departure) + "'>" + "</div>" + "</div>"
        + "</div>"
        + "<div class='col-sm-0'>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='stop' name='stop' readonly class='form-control-plaintext' value='" + currentDepartures[i].stop + "'>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='tripId' name='tripId' readonly class='form-control-plaintext' value='" + currentDepartures[i].tripId + "'>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='stopLat' name='stopLat' readonly class='form-control-plaintext' value='" + currentDepartures[i].stopLat + "'>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='stopLon' name='stopLon' readonly class='form-control-plaintext' value='" + currentDepartures[i].stopLon + "'>" + "</div>" + "</div>"
        + "<div class='row'>" + "<div class='col-sm'>" + "<input type='hidden' id='departure' name='departure' readonly class='form-control-plaintext' value='" + currentDepartures[i].departure + "'>" + "</div>" + "</div>"
        + "</div>"
        + "<div class='col-sm-9 my-auto text-center'>" + "<button type='submit' class='btn btn-secondary'>Register Ride</button>" + "</div>"
        + "</div>"
        + "</div>"
        + "</form></div>";
  }
}

/**
 * print warning message if one of user's busrides is an infection risk
 * @param {object} request - XMLHttpRequest
 * @param {object} stopId - stopId
 */
function warningMessage (request){
  var busrides = JSON.parse(request.response);
  // search through user's busrides until one found with infection risk
  for (var i=0; i<busrides.length; i++){
    if(busrides[i].isInfectionRisk){
      // then print warning message
      document.getElementById("infectionWarning").innerHTML =
        "<div class='alert alert-danger alert-dismissible fade show' role='alert'>At least one of your busrides " +
        "is considered an infection risk. Go to View Busrides for more information.</div>";
    }
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

  // when user clicks somewhere on map that position is given on to function manualUserPositionMap2
  map.on("click", function (e){
    manualUserPositionMap2(e.latlng.lat, e.latlng.lng);
  })
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

// check if user's busrides pose an infection risk and invoke function warningMessage
requestJSON2("http://localhost:3000/busrides/user", warningMessage);
