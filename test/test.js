"use_strict";

// test if intended output is same as real output of function toReadableTime
QUnit.test("Time Display", function(assert){
  var unixMillis = 1600118979021;
  assert.deepEqual(toReadableTime(unixMillis), "17:29", "Expected time is 17:29");
});

// test if intended output is same as real output of function toReadableDate
QUnit.test("Time and Date Display", function(assert){
  var unixMillis = 1600118979021;
  assert.deepEqual(toReadableDate(unixMillis), "Mon Sep 14 2020 17:29",
    "Expected time and date is Mon Sep 14 2020 17:29");
});

// test for successful API response
QUnit.test("Test for schedule-for-stop API response", function(assert){
  // instruct QUnit to pause test processing until done() is called
  var done = assert.async();
  /**
   * receives the response from the API call and compares the response status code
   * with the wanted code (200 = success)
   * @param {object} request - XMLHttpRequest
   */
  function testResponseStatus (request){
    var response = JSON.parse(request.response);
    assert.deepEqual(response.code, 200, "Successfully fetched the data from the API");
    done();
  }
  var stopId = "MTA_402505";
  // send API call
  sendToServer('{"stopId":"' + stopId + '"}', "http://localhost:3000/stopId");
  // request API response and give it on to function testResponseStatus and
  // invoke function testResponseStatus
  var t = setTimeout(function(){
    requestJSON2("http://localhost:3000/stopId=" + stopId, testResponseStatus);
  }, 3000);
});

// test for successful API response
QUnit.test("Test for stops-for-location API response", function(assert){
  // instruct QUnit to pause test processing until done() is called
  var done = assert.async();
  /**
   * receives the response from the API call and compares the response status code
   * with the wanted code (200 = success)
   * @param {object} request - XMLHttpRequest
   */
  function testResponseStatus (request){
    var response = JSON.parse(request.response);
    assert.deepEqual(response.code, 200, "Successfully fetched the data from the API");
    done();
  }
  var position = '{"latitude": 40.73061, "longitude": -73.935242}';
  // send API call
  sendToServer(position, "http://localhost:3000/userPosition");
  // request API response and give it on to function testResponseStatus and
  // invoke function testResponseStatus
  var t = setTimeout(function(){
    requestJSON2("http://localhost:3000/nearbyStops/lat=40.73061&lon=-73.935242",
    testResponseStatus);}, 2000);
});
