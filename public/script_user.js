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
 * logs user out
 */
function logout(){
  window.location.replace("http://localhost:3000");
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
    userPositionMap, geolocation);}, 1500);
}

/**
 * sends user position to server to request stops near user position from the API
 * after a timeout (to make sure request from API has been received) requests the server
 * for the API response and gives it on to and invokes function userPositionMap
 */
function manualUserPositionMap(){
  var lat = document.getElementById("user_lat").value;
  var lon = document.getElementById("user_lon").value;
  var position = '{"latitude":' + lat + ', "longitude":' + lon + '}';
  sendToServer(position, "http://localhost:3000/userPosition");
  position = {"coords": {"latitude": lat , "longitude": lon }};
  var t = setTimeout(function(){requestJSON("http://localhost:3000/nearbyStops/lat=" + lat + "&lon=" + lon,
    userPositionMap, position);}, 1500);
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
  document.getElementById("mapContainer").innerHTML ="<div id='mapId' style='height: 400px;'></div>";

  // create a Leaflet map, center is position of user
  var map = L.map('mapId').setView([point.lat,point.lon],15);
  osm.addTo(map);

  // add a marker at the position of user
  L.marker([point.lat,point.lon]).addTo(map).bindPopup("Your position").openPopup();

  if (stops.stops.length == 0){
    // if no stops nearby display message
    document.getElementById("mapError").innerHTML = "No stops within 1 km";
  }else{
    document.getElementById("mapError").innerHTML = "";
    // for all stops create a marker and popup with name of stop
    for(var i = 0; i < stops.stops.length; i++){
      L.marker(
        [stops.stops[i].lat,stops.stops[i].lon])
      .bindPopup("<p>" + stops.stops[i].name + "</p>")
      .addTo(map);
    };
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
document.getElementById("mapContainer").innerHTML ="<div id='mapId' style='height: 400px;'></div>";

// create a Leaflet map, center is position of user
var map = L.map('mapId').setView([40.730610,-73.935242],10);
osm.addTo(map);

//////////////////
// center map on user position
//////////////////

loadCurrentPosition();
