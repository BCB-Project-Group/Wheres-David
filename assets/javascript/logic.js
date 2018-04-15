//on Start

$(document).ready(function () {
  firebaseInit();
  createCommon();
  initialCheck();
});


//Jquery Functions


function displaySwitch() {
  //main display manipulations

  stateSwitch();

  function signInFade() {
    //effect on first time login

    window.header = false;

    $(".sign").css("display", "none");
    $("#sign-in").css("display", "block");
    $("#sign-in-banner-1").fadeIn(750, () => {
      setTimeout(() => {
        $("#sign-in-banner-2").fadeIn(750, () => {
          setTimeout(() => {
            $("#sign-in-form").fadeIn(750);
            listeners.signIn()
        }, 250);
        })
      }, 250)
    });
  }

  function homeFade() {
    checkHeader();
    $("#home").fadeIn(750)
  }

  function checkHeader() {
    if (!window.header) {
      $("body").attr("background", "assets/images/beer.jpg");
      $("header").fadeIn(750);
      window.header = true;
    }
  }

  function stateSwitch() {
    //dispatcher window.state


    $("section").css("display", "none");
    switch(state) {
      case "signIn":
        signInFade();
        break;
      case "home":
        homeFade();

    }
  }
}


//Database Functions

function firebaseInit() {
  // Initialize Firebase

  firebase.initializeApp({
    apiKey: "AIzaSyAP426TUbMdQpuzfglVFpU00R2n4-M32IE",
    authDomain: "bcb-project-1-cd6d1.firebaseapp.com",
    databaseURL: "https://bcb-project-1-cd6d1.firebaseio.com",
    projectId: "bcb-project-1-cd6d1",
    storageBucket: "bcb-project-1-cd6d1.appspot.com",
    messagingSenderId: "561097617085"
  });

  window.db = firebase.database();
}

function storeUser(input) {
  console.log("storeUser");
  try {
    dbRef.user = db.ref(`/users/${input}`);
    dbRef.user.set({
      username: input,
      location: userData.location,
      favorites: JSON.stringify(userData.favorites)
    });
    userData.name = input;
    localStorage.location = JSON.stringify(userData.location);
    localStorage.username = input;
    window.state = "home";
    displaySwitch()

  }
  catch(err) {
    console.log("waiting...");
    setTimeout(() => {
      storeUser(input)
    }, 500);
  }
}


//api communication

function getLocation() {
  //get user location and store in local/firebase

  // if (typeof localStorage.location === "undefined") {

    $.ajax({
      url: "http://api.ipstack.com/check?access_key=df701efc4e76275354fadbec1a5fd0e0&format=1",
      method: "GET"
    }).then(response => {

      window.userData.location = {
        city: response.city,
        state: response.region_name,
        zip: response.zip,
        lat: response.latitude,
        lon: response.longitude
      };
    });
  // }
}


// application logic

function createCommon() {
  //setup commonly used values

  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    console.log("bar toggle");
    $("#wrapper").toggleClass("toggled");
  });

  window.header = false;

  window.userData = {
    name: undefined,
    favorites: []
  };

  window.dbRef = {
    users: db.ref("/users")
  };


  window.listeners = {

    signIn: () => {

      $("#sign-in-form").on("submit", event => {
        event.preventDefault();
        let input = $("#username").val();
        dbRef.users.once("value").then(snap => {
          if (snap.exists()) {
            if(Object.keys(snap.val()).indexOf(input) < 0) {
              getLocation();
              storeUser(input)
            }
          }
          else {
            getLocation();
            storeUser(input)
          }
        })

      });
    }
  };
}

function initialCheck() {
  // check if user is signed in

  if(typeof localStorage.username !== "undefined") {
    let user = localStorage.username;
    db.ref(`/users/${user}`).once("value").then(snap => {
      if (snap.exists()) {
        userData.name = snap.val().username;
        userData.location = snap.val().location;
        userData.favorites = snap.val().favorites;
        window.dbRef.user = db.ref(`/users/${user}`);
        window.state = "home"
      }
      else {
        window.state = "signIn";
      }
      displaySwitch();
    })
  }
  else {
    window.state = "signIn";
    displaySwitch();
  }
}

//cheatcodes

function hardReset() {
  db.ref().set({});
  localStorage.clear();
  location.reload()
}


$(document.body).on("click", "#search-button", function(){
  event.preventDefault;
  var city = sanfrancisco;
  var state = ca;
  var queryURL = "http://beermapping.com/webservice/loccity/1d0dec692e53fe232ce728a7b7212c52/" + city + "," + state + "&s=json";
  // search the beermappingDB
  $.ajax({
      url: queryURL,
      method: "GET"
  }).then(function(response){
      console.log(response);
// for each item returned, create divs with identifying elemenets for use.

//       response.data.forEach(function(result) {
//           var topicDiv =$("<div>")
//           topicDiv.attr("class", "image-item")
//           var p = $("<p>").text("Rating: " + result.rating.toUpperCase())
//           var img = $("<img>")
//           img.attr("class", "gif")
//           img.attr("src", result.images.fixed_height_still.url)
//           img.attr("data-status", "still")
//           img.attr("still-image", result.images.fixed_height_still.url)
//           img.attr("moving-image", result.images.fixed_height.url)
// // attach returned information to new elements and prepend to html body
//           topicDiv.prepend(img, p)
//           $("#topics").prepend(topicDiv)

//       })
  })
})
// adding map, replace fixed latitude and longitude (37,-122) with the local storage values
var mymap = L.map('mapid').setView([37.7758, -122.4128], 16);

// adding map layer from mapbox
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZWdjYXJsIiwiYSI6ImNqZnhmcXljMjA5ZjkyeG5wcDNyZzR0cmIifQ.6TRl8bfjecwZjTuMbBlXFA'
}).addTo(mymap);

// creating a marker on the map, update to populate markers based on number of responses from beermapping
var marker = L.marker([37.7758, -122.4128]).addTo(mymap);

// adding popup to the marker that populates on click, add to reference yelp review information
marker.bindPopup("<b>Hello world!</b><br>I am a popup.");