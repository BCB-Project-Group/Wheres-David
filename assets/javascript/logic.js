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
    $("#favorites").fadeIn(750);
    window.brews.data = [userData.favorites];
    window.brews.offset = 0;
    displayBrews($("#favorites-results"), 0)
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

  //dynamically create elements

  $(`#${window.state}-results`).empty();

  if (window.brews.data[0].length < 1
    || window.brews.data[0][0].name === null) {

    target.append($(
      "<div class='row justify-content-center text-center color-text welcome'>" +
      "<h1 class='col-auto'>No Results Found</h1>" +
      "</div>")
    );
    return;
  }

  window.brews.data[offset].forEach(data => {

      //fix names formatted "name, the"
      if (data.name.indexOf(",") > -1) {
        data.name = data.name.split(",")[1] + " " + data.name.split(",")[0]
      }

      //big title, small street address
      let elem = $(
        `<div class="row justify-content-center mt-4 p-0">`
        + `<div class="col-12 search-result-div card btn" data-id="${data.id}" style="display: none; overflow: hidden">`
        + `<div class="row text-center justify-content-center card-body">`
        + `<div class="col-12 result-name result-text color-text" style="text-shadow: none"><h1>${data.name.split("-")[0]}</h1></div>`
        + `<div class="col-12 result-name result-text text-dark" style="text-shadow: none"><h2>${data.street}</h2></div>`
        + `</div></div></div>`
      );

      //store original data on jquery object
      elem.data("brew", data);
      target.append(elem);
    }
  );

  let counter = 0;
  let elems = $(".search-result-div").toArray();

  pageButtons(target, false);
  cascadeDisplay(elems, counter, target);
  listeners.map()
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
    url: "https://api.ipstack.com/check?access_key=df701efc4e76275354fadbec1a5fd0e0&format=1",
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

  let url = "https://beermapping.com/webservice/loccity/1d0dec692e53fe232ce728a7b7212c52/"
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
    favorites: [],
    favNames: []
  };

  window.dbRef = {
    users: db.ref("/users")
  };

  //map

  window.businessLat = 0.0;
  window.businessLong = 0.0;
  window.businessName = "";
  window.businessType = "";

// Populating map
  window.myMap = L.map('mapId').setView([businessLat, businessLong], 15);
// console.log("the lat " + businessLat + " and long " + businessLong + " of my map");
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZWdjYXJsIiwiYSI6ImNqZnhmcXljMjA5ZjkyeG5wcDNyZzR0cmIifQ.6TRl8bfjecwZjTuMbBlXFA'
  }).addTo(myMap);

// initial load of marker on map.  creating a marker on the map
  window.marker = L.marker([businessLat, businessLong]).addTo(myMap);

// adding popup to the marker that populates on click adding brewery name and type from beermapping
  marker.bindPopup("<b>" + businessName + "</b>" + "<br>" + businessType);
// console.log("i don't show up after first click on a div result")

  window.mpList = {
    city: $("#mod-city"),
    street: $("#mod-street"),
    phone: $("#mod-phone"),
    website: $("#mod-website"),
    rating: $("#mod-rating")
  };

  //listeners

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
        let clicked = $(this);
        console.log(clicked.attr("data-direction"));
        if (clicked.attr("data-direction") === "right"
        ) {
          console.log("right");
          brews.offset++;
          // $(".search-result-div").fadeOut(750, () => {
          displayBrews($(`#${window.state}-results`), brews.offset)
          //   }
          // );
        }

        else if (clicked.attr("data-direction") === "left"
          && brews.offset > 0) {
          console.log("left");
          brews.offset--;
          // $(".search-result-div").fadeOut(750, () => {
          displayBrews($(`#${window.state}-results`), brews.offset)
          //   }
          // );
        }
      });
    },

    search: () => {

      let form = $("#search-form");
      form.off("submit");
      form.on("submit", function (event) {
        event.preventDefault();
        getBrews(
          $("#city").val().trim().toLowerCase(),
          $("#state").val().trim().toLowerCase(),
        )
      });
    },

    map: () => {

      function mapExit() {
        let button = $("#exit-button");
        button.off("click");
        button.on("click", event => {
          event.preventDefault();
          mapModal.fadeOut(250);
        })
      }

      function favorite(current, parent) {
        let fav = $("#mod-fav");
        fav.removeClass("list-group-item-warning");
        fav.removeClass("list-group-item-danger");
        fav.removeClass("list-group-item-success");
        fav.removeClass("list-group-item-secondary");
        fav.off("click");
        if (userData.favNames.indexOf(current.name) < 0) {
          //addFavorite

          fav.addClass("list-group-item-warning");
          fav.text("Favorite");

          fav.on("click", event => {
            userData.favorites.push(current);

            userData.favNames.push(current.name);

            dbRef.user.update({
              favorites: JSON.stringify(userData.favorites)
            });

            fav.removeClass("list-group-item-warning");
            fav.addClass("list-group-item-success");
            fav.text("Saved!");
            fav.off("click")
          });
        }
        else {
          //removeFavorite

          fav.addClass("list-group-item-danger");
          fav.text("Un-Favorite");

          fav.on("click", event => {
            console.log("removing");
            userData.favorites.splice(
              userData.favNames.indexOf(current.name), 1);

            userData.favNames.splice(
              userData.favNames.indexOf(current.name), 1);

            dbRef.user.update({
              favorites: JSON.stringify(userData.favorites)
            });

            fav.removeClass("list-group-item-danger");
            fav.addClass("list-group-item-secondary");
            fav.text("Removed!");
            fav.off("click");

            if (window.state === "favorites") {
              parent.fadeOut(500);
            }
          });
        }
      }

      let searchResult = $(".search-result-div");
      let mapModal = $("#map-modal");
      searchResult.off("click");
      searchResult.on("click", function (event) {
        if (typeof $(this).attr("data-direction") !== "undefined") {
          return
        }

        let data = $(this).parent().data("brew");
        let selected = $(this).parent();
        let barID = $(this).attr("data-id");
        // console.log("this the bar ID of the div that was clicked - " + barID);
        // example of div: <div class="search-result-div" barID="31">Anchor Brewing</div>

        let queryURL = "https://beermapping.com/webservice/locmap/1d0dec692e53fe232ce728a7b7212c52/" + barID + "&s=json";
        // search the beermappingDB
        $.ajax({
          url: queryURL,
          method: "GET"
        }).then(function (response) {
          console.log("this is the response object - ", response);
          favorite(data, selected);
          mapModal.fadeIn(250, () => {
            mapExit();
          });

          response.forEach(element => {
            // console.log(element.lat);
            // console.log(element.lng);
            window.businessLat = element.lat;
            window.businessLong = element.lng;
            window.businessName = element.name;
            window.businessType = element.status;
            $("#map-title").text(window.businessName);
            mpList.city.text("City: " + data.city);
            mpList.street.text("Street: " + data.street);
            if (data.phone.length < 1) {
              mpList.phone.text("Phone: Unavailable");
            }
            else {
              mpList.phone.text("Phone: " + data.phone);
            }
            if (data.url.length < 1) {
              mpList.website.text("Website: Unavailable");
              mpList.website.attr("href", `#`);
            }
            else {
              mpList.website.text(data.url);
              mpList.website.attr("href", `https://${data.url}`);
            }
            if (parseInt(data.overall) < 1) {
              mpList.rating.text("Rating: Unavailable");
            }
            else {
              mpList.rating.text("Rating: " + data.overall);
            }
            // console.log(businessLat + "this is now var businessLat");
            // console.log(businessLong + "this is now var businessLong");
            myMap.invalidateSize();
            window.myMap.setView(new L.LatLng(window.businessLat, window.businessLong), 15);
            window.marker.setLatLng(new L.LatLng(window.businessLat, window.businessLong));
            window.marker.setPopupContent("<b>" + window.businessName + "</b>" + "<br>" + window.businessType).openPopup();
          })
        })
      });
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
        userData.favorites = JSON.parse(snap.val().favorites);
        userData.favorites.forEach(entry => {
          userData.favNames.push(entry.name)
        });
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
