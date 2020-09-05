"use_strict";

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
 * @param {object} object - parameter of cFunction
 */
function requestJSON (url, cFunction, object) {
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
 * converts from unix time to human-readable time and between timezones
 * @param {number} unix - unix time in milliseconds
 * @return {string} - time e.g. "10:04"
 */
function toReadableTime (unix) {
  // unix considered to be UTC
  var time = new Date (unix);
  // Münster = UTC+2, NYC=UTC-4, so from Münster to NYC -6 hours
  // not an ideal solution, but works (at least until next time change)
  var hours = time.getHours();
  var minutes = time.getMinutes();
  if (hours == 5){
    if (minutes < 10){
      return "" + 23 + ":0" + minutes;
    }else{
      return "" + 23 + ":" + minutes;
    }
  }
  if (hours == 4){
    if (minutes < 10){
      return "" + 22 + ":0" + minutes;
    }else{
      return "" + 22 + ":" + minutes;
    }
  }
  if (hours == 3){
    if (minutes < 10){
      return "" + 21 + ":0" + minutes;
    }else{
      return "" + 21 + ":" + minutes;
    }
  }
  if (hours == 2){
    if (minutes < 10){
      return "" + 20 + ":0" + minutes;
    }else{
      return "" + 20 + ":" + minutes;
    }
  }
  if (hours == 1){
    if (minutes < 10){
      return "" + 19 + ":0" + minutes;
    }else{
      return "" + 19 + ":" + minutes;
    }
  }
  if (hours == 0){
    if (minutes < 10){
      return "" + 18 + ":0" + minutes;
    }else{
      return "" + 18 + ":" + minutes;
    }
  }
  if (minutes < 10){
    return "" + hours-6 + ":0" + minutes;
  }else{
    return "" + hours-6 + ":" + minutes;
  }
}

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
 * after a timeout (to make sure request from API has been received) requests the server
 * for the API response and gives it on to and invokes function userPositionMap
 * @param {object} geolocation - calculated by loadCurrentPosition function
 */
function geolocationUserPositionMap(geolocation){
  var lat = geolocation.coords.latitude;
  var lon = geolocation.coords.longitude;
  var position = '{"latitude":' + lat + ', "longitude":' + lon + '}';
  sendToServer(position, "http://localhost:3000/userPosition");
  var t = setTimeout(function(){requestJSON("http://localhost:3000/nearbyStops/lat=" + lat + "&lon=" + lon,
    userPositionMap, geolocation);}, 2000);
}

/**
 * sends position of point user clicked on to server to request stops near this position from the API
 * after a timeout (to make sure request from API has been received) requests the server
 * for the API response and gives it on to and invokes function userPositionMap
 */
function manualUserPositionMap2(lat, lon){
  document.getElementById("stopInfo").innerHTML = "";
  var position = '{"latitude":' + lat + ', "longitude":' + lon + '}';
  sendToServer(position, "http://localhost:3000/userPosition");
  position = {"coords": {"latitude": lat , "longitude": lon }};
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
    iconUrl: 'public/marker-icon-gold.png',
    shadowUrl: 'public/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // add a marker at the position of user
  L.marker([point.lat,point.lon], {icon: goldIcon, title: "Your position"}).addTo(map).bindPopup("Your position").openPopup();

  if (stops.stops.length == 0){
    // if no stops nearby display message
    //document.getElementById("mapError").innerHTML = "No stops within 200 m";
    document.getElementById("mapError-Container").innerHTML =
      "<div class='alert alert-danger' role='alert'>No stops within 200 m</div>";
  }else{
    document.getElementById("mapError-Container").innerHTML = "";
    // for all stops create a marker and popup with name of stop
    for(var i = 0; i < stops.stops.length; i++){
      L.marker(
        [stops.stops[i].lat,stops.stops[i].lon], {title: stops.stops[i].id})
      .bindPopup("<p>" + stops.stops[i].name + "</p>")
      // when user clicks on marker function markerOnClick is invoked
      .on("click", function(){markerOnClick(this.options.title);})
      .addTo(map);
    };
  }
}

/**
 * sends the stopCode to the server for it to request current departures at this stops from API
 * invokes function printCurrentDepartures after timeout
 * @param {string} stopId - id of stop
 */
function markerOnClick(stopId){
  document.getElementById("stopInfo").innerHTML = "";
  sendToServer('{"stopId":"' + stopId + '"}', "http://localhost:3000/stopId");
  var t = setTimeout(function(){
    requestJSON("http://localhost:3000/stopId=" + stopId, printCurrentDepartures, stopId);
  }, 3000);
}

/**
 * prints current departures at nearby stops
 * @param {object} request - XMLHttpRequest
 * @param {object} stopId - stopId
 */
function printCurrentDepartures(request, stopId){
  var departures = JSON.parse(request.response);
  document.getElementById("stopInfo").innerHTML += "<h4 class='bg-dark text-white text-center'>"
    + departures.data.references.stops[0].name + "</h4>";
  // departures consists of a schedule for the busstop for the whole day
  // compare with current time and only display departures within -5 to +20 minutes of current time
  // save these in currentDepartures
  var currentDepartures = [];
  // 5 minutes before currentTime = - 5*60*1000 (milliseconds)
  var minCurrentTime = departures.currentTime - 5*60*1000;
  // 20 minutes after currentTime = + 20*60*1000 (milliseconds)
  var maxCurrentTime = departures.currentTime + 20*60*1000;
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
  console.log(currentDepartures);
  if (currentDepartures.length == 0){
    document.getElementById("stopInfo").innerHTML += "<div class='container-fluid bg-light'> <p>No current departures</p> </div>";
  }
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

// create a Leaflet map, center is position of user
var map = L.map('mapId').setView([40.730610,-73.935242],10);
osm.addTo(map);

// when user clicks somewhere on map that position is given on to function manualUserPositionMap2
map.on("click", function (e){
  manualUserPositionMap2(e.latlng.lat, e.latlng.lng);
})

//////////////////
// center map on user position
//////////////////

loadCurrentPosition();
