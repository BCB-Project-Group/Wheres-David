//on Start

$(document).ready(function () {
  firebaseInit();
  createCommon();
  // checkDatabase();
  displaySwitch();
});


//Jquery Functions


function displaySwitch() {
  //main display manipulations

  function signInFade() {
    //effect on first time login

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


  signInFade()
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
  window.userData.name = input;
  localStorage.location = JSON.stringify(userData.location);
  localStorage.username = input;
  console.log("storeUser");
  try {
    db.ref(`/users/${input}`).set({
      username: input,
      location: userData.location
    })
  }
  catch(err) {
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


// information storage and retrieval

function createCommon() {
  //setup commonly used values

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

//cheatcodes

function hardReset() {
  db.ref().set({});
  localStorage.clear();
  location.reload()
}
