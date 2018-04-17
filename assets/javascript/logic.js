//on Start

$("section").css("display", "none");
$(document).ready(function () {
  firebaseInit();
  createCommon();
  alchoholText();
  initialCheck();
  listeners.resize();
  listeners.menu();
  listeners.sideBar();
});


//Jquery Functions


function viewPortScale() {
  //set wrapper height based off of viewport

  let width = $(window).width;

  $("#wrapper").height(
    $(window).height() - $("header").height() + 10);


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
            window.listeners.signIn()
          }, 250);
        })
      }, 250)
    });
  }

  function homeFade() {
    checkHeader();
    $("#mod-text").text(`Brews near ${userData.location.city}`);
    $("#mod-state").text(userData.location.stateFull);
    getBrews(userData.location.city,
      userData.location.state.toLowerCase());
    $("#home").fadeIn(750)
  }

  function searchFade() {
    checkHeader();
    listeners.search();
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
    switch (state) {
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
        aboutFade();
        break;
    }
  }
}

function displayBrews(target, offset) {

  function cascadeDisplay(array, i, target) {
    //cascade effect for dynamic results

    console.log("cascade");

    if (i < array.length) {
      $(array[i]).fadeIn(50, () => {
        i++;
        cascadeDisplay(array, i, target)
      });
    }
    else {
      pageButtons(target, true)
    }
  }

  function pageButtons(target, pos) {
    //create display buttons and activate listener

    console.log("page buttons");

    let row = $("<div class='row mt-4 mob-row p-0'></div>");

    let left = $(
      "<div class='left col-6 text-center btn mob-button p-0 m-0 card search-result-div'"
      + " data-direction='left'><p><</p></div>"
    );
    if (brews.offset === 0) {
      left.addClass("invisible")
    }
    row.append(left);

    let right = $(
      "<div class='right col-6 text-center btn mob-button p-0 m-0 card search-result-div'"
      + " data-direction='right'><p>></p></div>"
    );
    if (brews.offset === brews.data.length - 1) {
      right.addClass("invisible")
    }
    row.append(right);

    if (!pos) {
      target.prepend(row);
    }
    else if (pos) {
      target.append(row);
      listeners.mobility()
    }
  }

  $(`#${window.state}-results`).empty();
  console.log("initial");
  window.brews.data[offset].forEach(data => {
      let elem = $(
        `<div class="row justify-content-center mt-4 p-0">`
        + `<div class="col-12 search-result-div card" data-id="${data.id}" style="display: none">`
        + `<div class="row text-center card-body">`
        + `<div class="col-md-3 col-12 result-name result-text">${data.name}</div>`
        + `<div class="col-md-3 col-12 result-address result-text">${data.street}</br>${data.zip}</div>`
        + `<div class="col-md-3 col-12 result-phone result-text">${data.phone}</div>`
        + `<div class="col-md-3 col-12 result-url result-text"><a class="r-link" href="https://${data.url}" target="_blank">Website</a></div>`
        + `</div></div></div>`
      );

      target.append(elem);
    }
  );

  let counter = 0;
  let elems = $(".search-result-div").toArray();

  pageButtons(target, false);
  cascadeDisplay(elems, counter, target);
}

function alchoholText() {
  let text = ["Amber", "Lager", "Blonde", "Pilsner", "Stout", "Porter", "Sour", "Bitter", "IPA", "Wheat", "Cider", "Ale"];
  let counter = 0;
  let elem = document.getElementById("role");
  let inst = setInterval(change, 1400);

  function change() {
    elem.innerHTML = text[counter];
    counter++;
    if (counter >= text.length) {
      counter = 0;
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
    dbRef.user = db.ref(
      `/users/${input}`
    );
    dbRef.user.set({
      username: input,
      location: userData.location,
      favorites: JSON.stringify(userData.favorites)
    });
    userData.name = input;
    localStorage.location = JSON.stringify(userData.location);
    localStorage.username = input;
    window.state = "home";
    displaySwitch();

  }
  catch (err) {
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

    console.log(response);

    window.userData.location = {
      city: response.city.toLowerCase(),
      state: response.region_code.toLowerCase(),
      stateFull: response.region_name,
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
    console.log(response);
    separateResults(response);
    displayBrews($(
      `#${window.state}-results`
    ), 0)
  });
}


// application logic

function createCommon() {
  //setup commonly used values

  window.header = false;
  window.repetitionGate = false;

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
            if (Object.keys(snap.val()).indexOf(input) < 0) {
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

      let a = $(".sideLink");

      a.on("click", function (event) {
        event.preventDefault();
        let clicked = $(this);
        $("#wrapper").toggleClass("toggled");

        switch (clicked.attr("data-dir")) {
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

      $(window).on("resize", () => {
        viewPortScale()
      });
    },

    menu: () => {

      $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
      });
    },

    mobility: () => {

      let mob = $(".mob-button");
      mob.off("click");

      mob.on("click", function (event) {

        event.preventDefault();
        console.log("left");
        let clicked = $(this);
        if (clicked.attr("data-direction") === "right"
          && brews.offset < brews.data.length - 1) {
          console.log("more brews");
          brews.offset++;
          // $(".search-result-div").fadeOut(750, () => {
          displayBrews($(`#${window.state}-results`), brews.offset)
          //   }
          // );
        }

        else if (clicked.attr("data-direction") === "left"
          && brews.offset > 0) {
          brews.offset--;
          // $(".search-result-div").fadeOut(750, () => {
          console.log("more brews");
          displayBrews($(`#${window.state}-results`), brews.offset)
          //   }
          // );
        }
      });
    },

    search: () => {

      let form = $("#search-form");
      form.off("submit");
      form.on("submit", function(event) {
        event.preventDefault();
        getBrews(
          $("#city").val().toLowerCase(),
          $("#state").val().toLowerCase(),
          )
      });
    },

    map: () => {

      $(".search-result-div").on("click", function () {

        let barID = $(this).attr("data-id");

        console.log("this the bar ID of the div that was clicked - " + barID);
        // example of div: <div class="search-result-div" barID="31">Anchor Brewing</div>


        let queryURL = "http://beermapping.com/webservice/locmap/1d0dec692e53fe232ce728a7b7212c52/" + barID + "&s=json";
        // search the beermappingDB
        $.ajax({
          url: queryURL,
          method: "GET"
        }).then(function (response) {
          console.log("this is the response object - ", response);

          response.forEach(element => {
            console.log(element.lat);
            console.log(element.lng);

            let lat = element.lat;
            let long = element.lng;
            let name = element.name;
            let type = element.status;

            // adding map with the attributes of the clicked items, let mymap is setting the initial view center window

            let mymap = L.map('mapid').setView([lat, long], 16);
            console.log("the lat " + lat + " and long " + long + " of my map")
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
              attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
              maxZoom: 18,
              id: 'mapbox.streets',
              accessToken: 'pk.eyJ1IjoiZWdjYXJsIiwiYSI6ImNqZnhmcXljMjA5ZjkyeG5wcDNyZzR0cmIifQ.6TRl8bfjecwZjTuMbBlXFA'
            }).addTo(mymap);

            // creating a marker on the map, supposed to update with marker based on responses from beermapping, but doesn't update currently
            let marker = L.marker([lat, long]).addTo(mymap);

            // adding popup to the marker that populates on click, add to brewery name and type from beermapping. the names do not currently update
            marker.bindPopup("<b>" + name + "</b>" + "<br>"+ type);
            console.log("i don't show up after first click on a div result")
          });

        })
      })
    }
  };
}

function initialCheck() {
  // check if user is signed in

  if (typeof localStorage.username !== "undefined") {
    let user = localStorage.username;
    db.ref(
      `/users/${user}`
    ).once("value").then(snap => {
      if (snap.exists()) {
        userData.name = snap.val().username;
        userData.location = snap.val().location;
        userData.favorites = snap.val().favorites;
        window.dbRef.user = db.ref(
          `/users/${user}`
        );
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
