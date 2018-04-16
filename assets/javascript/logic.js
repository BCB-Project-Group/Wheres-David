//on Start

$(document).ready(function () {
  firebaseInit();
  createCommon();
  initialCheck();
  listeners.resize();
  listeners.sideBar();
});


//Jquery Functions


function viewPortScale() {
  //set wrapper height based off of viewport
  console.log("scaling...");
  $("#wrapper").height($(window).height() - $("header").height());
}


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

  function searchFade() {
    checkHeader();
    $("#search").fadeIn(750)
  }

  function favoritesFade() {
    checkHeader();
    $("#favorites").fadeIn(750)
  }

  function aboutFade() {
    checkHeader();
    $("#about").fadeIn(750)
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

    viewPortScale();

    $("section").css("display", "none");
    switch(state) {
      case "signIn":
        signInFade();
        break;
      case "home":
        homeFade();
        break;
      case "search":
        searchFade();
        break;
      case "favorites":
        favoritesFade();
        break;
      case "about":
        console.log("bout");
        aboutFade();
        break;
    }
  }
}

function displayBrews(target, offset) {

  $(".results").empty();
  brews.data[offset].forEach(data => {
    console.log("doin it");
    let elem = $(
      `<div class="row justify-content-center">`
      + `<div class="col-12 search-result-div card">`
      + `<div class="row text-center card-body">`
      + `<div class="col-3">name</div>`
      + `<div class="col-3">location</div>`
      + `<div class="col-3">rating</div>`
      + `<div class="col-3">other stuff</div>`
      + `</div></div></div>`
    );

    target.append(elem)
  });
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
}

function getBrews(city, state) {
  //search brews

  function separateResults(response) {
    //separate ajax response into sets of 20

    let i = 0;
    let tmp = [];
    window.brews = {
      offset: 0,
      data: []
    };

    response.forEach((brew, index) => {

      if (i < 20) {
        tmp.push(brew);
        i++;

      if (index === response.length - 1) {
          brews.data.push(tmp);
        }
      }

      else {
        brews.data.push(tmp);
        tmp = [];
        i = 0
      }
    });
  }

  let url = "http://beermapping.com/webservice/loccity/1d0dec692e53fe232ce728a7b7212c52/"
    + city
    + ","
    + state
    + "&s=json";

  $.ajax({
    url: url,
    method: "GET"
  }).then(response => {
    separateResults(response)
  });
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
    },

    sideBar: () => {

      let a = $("a");
      a.on("click", function(event) {
        event.preventDefault();
        let clicked = $(this);
        console.log(clicked.attr("data-dir"));

        switch(clicked.attr("data-dir")) {
          case "about":
            window.state = "about";
            displaySwitch();
            break;
          case "search":
            window.state = "search";
            displaySwitch();
            break;
          case "favorites":
            window.state = "favorites";
            displaySwitch();
            break;
          case "home":
            window.state = "home";
            displaySwitch();
            break;
        }
      })

    },

    resize: () => {

      $(window).on("resize",  () => {
        viewPortScale()
      })
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
