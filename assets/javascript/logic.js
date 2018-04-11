//ipTracker: git@github.com: aa06ff996ecd0ae05b9bfb880e62c341
//beermap: 1d0dec692e53fe232ce728a7b7212c52
//yelp: IzZ34FIAMNva9johakunbjMVmTw3ZbRFXiu6ved7JaPnIkUUFBW5BUm_Hxt9A9fZVlBfPovlADmb3VVd8htA9qi98Ncg7ZaT6TShP7pagsvJ95suo5fg63vR5A7JWnYx


$(document).ready(function () {
  firebaseInit();
  createCommon();
  beerFormListener();
});

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

function beerFormListener() {
  //event listener for search form

  $("#beerform").submit(function (event) {
    event.preventDefault();
    window.formInputs = {
      userName: $("#username").val().trim(),
      city: $("#city").val().trim(),
      zipCode: $("#zipcode").val().trim,
      select: $("#state option:selected").text()
    }
  });
}

function createCommon() {
  //setup commonly used values

  window.userData = {
    name: undefined,
    favorites: []
  };

  window.dbRef = {
    users: db.ref("/users")
  };

}

function checkDatabase() {
  if (typeof localStorage.username !== "undefined") {
    window.userData.name = localStorage.username;
    db.ref(`/users/${window.userData.name}`).once("value").then(snap => {
       if (snap.val() !== null) {
         console.log("exists");
       }
       else {
         localStorage.usetname = undefined;
       }
    })
  }
}

