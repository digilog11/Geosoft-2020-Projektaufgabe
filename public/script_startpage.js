"use_strict";

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
 * creates a new user in database
 * @param {object} request - XMLHttpRequest
 */
function createUser (request){
  var users = JSON.parse(request.response);
  var username = JSON.stringify(document.getElementById("new_user_username").value);
  var password = JSON.stringify(document.getElementById("new_user_password").value);
  var passwordRep = JSON.stringify(document.getElementById("new_user_password_rep").value);
  // display error message if username already exists
  for(var i = 0; i < users.length; i++){
    if(username == JSON.stringify(users[i].username)){
      document.getElementById("new_user_error").innerHTML = "username already exists, choose another";
      return;
    }
  }
  // display error message if user didn't repeat password correctly
  if (password != passwordRep){
    document.getElementById("new_user_password").value = "";
    document.getElementById("new_user_password_rep").value = "";
    document.getElementById("new_user_error").innerHTML = "password not correctly repeated";
  }
  else{
    var user = '{"username":' + username + ', "password":' + password + '}';
    sendToServer(user, "http://localhost:3000/userCreated");
    //redirect
    window.location.replace("http://localhost:3000/user");
  }
}

/**
 * creates a new doctor in database
 * @param {object} request - XMLHttpRequest
 */
function createDoctor (request){
  var doctors = JSON.parse(request.response);
  var username = JSON.stringify(document.getElementById("new_doctor_username").value);
  var password = JSON.stringify(document.getElementById("new_doctor_password").value);
  var passwordRep = JSON.stringify(document.getElementById("new_doctor_password_rep").value);
  // display error message if username already exists
  for(var i = 0; i < doctors.length; i++){
    if(username == JSON.stringify(doctors[i].username)){
      document.getElementById("new_doctor_error").innerHTML = "username already exists, choose another";
      return;
    }
  }
  // display error message if user didn't repeat password correctly
  if (password != passwordRep){
    document.getElementById("new_doctor_password").value = "";
    document.getElementById("new_doctor_password_rep").value = "";
    document.getElementById("new_doctor_error").innerHTML = "password not correctly repeated";
  }
  else{
    var doctor = '{"username":' + username + ', "password":' + password + '}';
    sendToServer(doctor, "http://localhost:3000/doctorCreated");
    //redirect
    window.location.replace("http://localhost:3000/doctor");
  }
}

/**
 * logs a user in
 * @param {object} request - XMLHttpRequest
 */
function loginUser (request){
  var users = JSON.parse(request.response);
  var username = JSON.stringify(document.getElementById("user_username").value);
  var password = JSON.stringify(document.getElementById("user_password").value);
  for(var i = 0; i < users.length; i++){
    if(username == JSON.stringify(users[i].username)){
      if(password == JSON.stringify(users[i].password)){
        //redirect
        window.location.replace("http://localhost:3000/user");
      }else{
        // display error message if password incorrect
        document.getElementById("user_error").innerHTML = "password incorrect";
      }
    }
    else if(i == users.length-1 && username != JSON.stringify(users[i].username)){
      // display error message if username doesn't exists
      document.getElementById("user_error").innerHTML = "username doesn't exist";
    }
  }
}

/**
 * logs a doctor in
 * @param {object} request - XMLHttpRequest
 */
function loginDoctor (request){
  var doctors = JSON.parse(request.response);
  var username = JSON.stringify(document.getElementById("doctor_username").value);
  var password = JSON.stringify(document.getElementById("doctor_password").value);
  for(var i = 0; i < doctors.length; i++){
    if(username == JSON.stringify(doctors[i].username)){
      if(password == JSON.stringify(doctors[i].password)){
        //redirect
        window.location.replace("http://localhost:3000/doctor");
      }else{
        // display error message if password incorrect
        document.getElementById("doctor_error").innerHTML = "password incorrect";
      }
    }
    else if(i == doctors.length-1 && username != JSON.stringify(doctors[i].username)){
      // display error message if username doesn't exists
      document.getElementById("doctor_error").innerHTML = "username doesn't exist";
    }
  }
}
