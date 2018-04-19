# Where's David

A modern search engin for your weekend excapades

Deployed: https://bcb-project-group.github.io/Wheres-David/

## instructions

where's david is a scalable app to aid in the search for your nightly spot. To get started, enter a username into the login screen. This is arbitrary since you will stay signed in until the local storage in your browser is refreshed. it is only neccisary for identifying your web client to the database in order to keep track of your saved search results. Password protection is unneccisary du to the fact that absolutely no identifying or personal data is stored throught the use of this app.

On the home screen you will see brewery, bar, and liquor store search results nearby the location derrived from your current ip adress. This page will always show your local results; However, if you wish to see results for a different location, you can navigate to the search page. Click the menu button at the top right corner of the page to access the sidebar, which contains links to other locations on the site. On the search page, you can currently search by city and state, in the format of "city name," "two character region code". when you click on any search result element on the page, a modal window will appear with additional information and a responsive map centered to the location of the selected business. The map window also includes a favorite button, which will save the search information for that business and add it to your own personal favorites page.

The favorites page functions similarly to the search and home pages. On this page will appear your favorited buisinesses in no particular order. If you wish to remove an item from your favorites, you can click on its element to go to the map modal and press the remove button in the same location that the favorites button formerly appeared.

## dependencies

This project makes extensive use of:

- Bootstrap3
- jQuery
- Leaflet.js
- beermapping api
- ipstack api

## attributions

- Icons taken from iconfinder.com
- large images taken from pixalbay.com

## Kown issues

- Occasionally the map modal in lower viewport widths will display information erratically
- The beermapping api is unreliable and non-comprehensive, thus occasionally ajax queries for brewery information will not go through or just plain not exist
- The contact email form will not work when hosted locally or on github pages, only when hosted full stack.