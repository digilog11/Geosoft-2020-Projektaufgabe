/**
 * uses xhr to request a JSON from an url and after success invokes a function
 * @param {string} url - url from which to request the JSON
 * @param {string} cFunction - name of function to be called after request is ready
 */
function requestJSON2 (url, cFunction) {
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

function markerOnClick(stop){
  document.getElementById("busrideInfo").innerHTML = "";
  requestJSON("http://localhost:3000/busrides/user", printBusrideInfo, stop);
}

function printBusrideInfo(request, stop){
  var busrides = JSON.parse(request.response);
  document.getElementById("busrideInfo").innerHTML += "<h4 class='bg-dark text-white text-center'>"
    + stop + "</h4>";
  console.log(busrides);
  for(var i=0; i < busrides.length; i++){
    if(stop == busrides[i].stop){
      if(busrides[i].isInfectionRisk){
        document.getElementById("busrideInfo").innerHTML +=
          "<div class='container-fluid bg-light mb-2'><form>"
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
          + "</div>"
          + "</form></div>";
      }else{
        document.getElementById("busrideInfo").innerHTML +=
          "<div class='container-fluid bg-light mb-2'><form>"
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
          + "</div>"
          + "</form></div>";
      }
    }
  }
}

function toreadableDate(unix){
  // for more info on why time conversion go to script_dashboard toRedableTime()
  var unixTimezoneConversion = unix - 6*60*60*1000;
  var date = new Date(unixTimezoneConversion);
  var string = date.toString();
  return string.substr(0,21);
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

// request user's busrides from Server
requestJSON2("http://localhost:3000/busrides/user", updateMap);
