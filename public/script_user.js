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
  document.getElementById("mapContainer").innerHTML ="<div id='mapId' style='height: 400px;'></div>";

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
    document.getElementById("mapError").innerHTML = "No stops within 200 m";
  }else{
    document.getElementById("mapError").innerHTML = "";
    // for all stops create a marker and popup with name of stop
    for(var i = 0; i < stops.stops.length; i++){
      L.marker(
        [stops.stops[i].lat,stops.stops[i].lon], {title: stops.stops[i].code})
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
 * @param {string} stopCode - identifying code of stop
 */
function markerOnClick(stopCode){
  console.log("currentDepartures");
  document.getElementById("stopInfo").innerHTML = "";
  sendToServer('{"stopCode":' + stopCode + '}', "http://localhost:3000/stopCode");
  var t = setTimeout(function(){
    requestJSON("http://localhost:3000/monitoringRef=" + stopCode, printCurrentDepartures, stopCode);
  }, 3000);
}

/**
 * prints current departures at nearby stops
 * @param {object} request - XMLHttpRequest
 * @param {number} stopCode - stopCode
 */
function printCurrentDepartures(request, stopCode){
  console.log("printCurrentDepartures");
  var departures = JSON.parse(request.response);
  document.getElementById("stopInfo").innerHTML += "<p> Stop: "
    + departures.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney.MonitoredCall.StopPointName + "</p>";
  for (var i = 0; i < departures.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit.length; i++){
    if(departures.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[i].MonitoredVehicleJourney.MonitoredCall.hasOwnProperty("ExpectedDepartureTime")){
      document.getElementById("stopInfo").innerHTML += "<p>" + "StopCode: " + stopCode + " i: " + i +
        " Line: " + departures.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[i].MonitoredVehicleJourney.PublishedLineName
        + " Destination: " + departures.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[i].MonitoredVehicleJourney.DestinationName
        + " Departure: " + getTimeFromISO(departures.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[i].MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime)
        + "</p>" + '<button onclick="">' + "I took this ride" + '</button>' + "<br>";
    }
  }
}

/**
 * splits the time from the ISO-Date-String and returns it
 * @param {string} iso - ISO-Date-String ex. "2020-08-21T20:29:06.520-04:00"
 * @return {string} - time ex. "20:29"
 */
function getTimeFromISO(iso){
  //var time = new Date(iso).toLocaleTimeString("en-US", {timeStyle: "short", hour12: false, timeZone: "UTC"});
  //var time = getTime(new Date(iso).getTime());
  var str = iso.substr(11,5);
  return str;
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

// when user clicks somewhere on map that position is given on to function manualUserPositionMap2
map.on("click", function (e){
  manualUserPositionMap2(e.latlng.lat, e.latlng.lng);
})

//////////////////
// center map on user position
//////////////////

loadCurrentPosition();
