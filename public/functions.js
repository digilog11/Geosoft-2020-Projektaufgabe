"use_strict";

/**
 * converts unix milliseconds to a human-readable time string and considers
 * time zone conversion from testing time zone (CEST) to application time zone (EDT)
 * @param {number} unix - unix time in milliseconds
 * @return {string} - time e.g. "10:04"
 */
function toReadableTime (unix) {
  // since the Date() function automatically converts to the PCs local time
  // time zone conversion between testing zone (Germany) and application zone (NYC) is needed
  // Germany is currently 6 hours ahead, so those are subtracted from unix
  var unixTimezoneConversion = unix - 6*60*60*1000;
  var time = new Date (unixTimezoneConversion);
  var hours = time.getHours();
  var minutes = time.getMinutes();
  if (minutes < 10){
    return "" + hours + ":0" + minutes;
  }else{
    return "" + hours + ":" + minutes;
  }
}

/**
 * converts unix milliseconds to a human-readable time string and considers
 * time zone conversion from testing time zone (CEST) to application time zone (EDT)
 * @param {number} unix - time in unix milliseconds
 * @return {string} - readable date + time string e.g. "Wed Sep 09 2020 11:46"
 */
function toReadableDate (unix){
  // since the Date() function automatically converts to the PCs local time
  // time zone conversion between testing zone (Germany) and application zone (NYC) is needed
  // Germany is currently 6 hours ahead, so those are subracted from unix
  var unixTimezoneConversion = unix - 6*60*60*1000;
  var date = new Date(unixTimezoneConversion);
  var string = date.toString();
  return string.substr(0,21);
}

/**
 * sends object to destination via POST-Request
 * @param {object} object - JSON object
 * @param {string} destination - destination address
 */
function sendToServer (object, destination){
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
