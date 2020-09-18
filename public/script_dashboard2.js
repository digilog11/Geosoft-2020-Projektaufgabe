"use_strict";

/**
 * creates markers for all of the user's busrides, those with infection risk in red, otherwise green
 * if user clicks on marker, invoke function markerOnClick
 * @param {object} request - XMLHttpRequest
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
 * @param {string} stop - name of busstop
 */
function markerOnClick (stop){
  document.getElementById("busrideInfo").innerHTML = "";
  // request all busrides of user from database and give those on as a JSON
  // to function printBusrideInfo
  requestJSON("http://localhost:3000/busrides/user", printBusrideInfo, stop);
}

/**
 * displays information about the busrides user took at this busstop
 * @param {object} request - XMLHttpRequest
 * @param {string} stop - name of busstop
 */
function printBusrideInfo (request, stop){
  var busrides = JSON.parse(request.response);
  // print busstop name
  document.getElementById("busrideInfo").innerHTML += "<h4 class='bg-dark text-white text-center'>"
    + stop + "</h4>";
  // search for the busrides the user took at this busstop
  // display information about these busrides
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
          + "<div class='row'>" + "<div class='col-sm'>" + "<input type='text' id='time' name='time' readonly class='form-control-plaintext' value='" + toReadableDate(busrides[i].departureTime) + "'>" + "</div>" + "</div>"
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

//////////////////

initializeMap();

// request user's busrides from database and invoke function updateMap
requestJSON2("http://localhost:3000/busrides/user", updateMap);
