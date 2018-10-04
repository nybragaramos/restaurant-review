let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.initFirebase();// Initialize Firebase
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
  $('header').load('header.html'); 
  $('footer').load('footer.html'); 
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
   DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if(error) {
      console.log(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  neighborhoods.forEach(neighborhood => {
    $('#neighborhoods-select').append(`<option value="${neighborhood}" aria-label=${neighborhood}>${neighborhood}</option>`);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  cuisines.forEach(cuisine => {
    $('#cuisines-select').append(`<option value="${cuisine}" aria-label=${cuisine}>${cuisine}</option>`);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibmFkamF5YW5uYSIsImEiOiJjam1obXNsc3EwYTB4M3FycjVhdmRrMzVoIn0.eWeCIP1-J4HF842vprpnRQ',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}

initFirebase = () => {
  firebase.initializeApp({
    apiKey: "AIzaSyB7FsjinoYLISVk8g43GzY7_avpzJhpFxE",
    authDomain: "restaurant-reviews-ab33f.firebaseapp.com",
    databaseURL: "https://restaurant-reviews-ab33f.firebaseio.com",
    projectId: "restaurant-reviews-ab33f",
    storageBucket: "",
    messagingSenderId: "811582858998"
  });
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  $('.restaurants-list').html('');

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const restaurantsSection = $('.restaurants-list');
  if(restaurants.length != 0) {
    $('.no-restaurants').hide();
    restaurants.forEach(restaurant => {
      restaurantsSection.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
  } else {
    $('.no-restaurants').show();
  }
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const article = document.createElement('li');
  article.className = 'restaurants-list-item';

  const picture = document.createElement('picture');
  article.append(picture);

  const tablet = document.createElement('source');
  tablet.media = '(min-width: 551px) and (max-width: 870px)';
  tablet.srcset = DBHelper.imageUrlForRestaurantSmall(restaurant);
  picture.append(tablet);

  const smartphone = document.createElement('source');
  smartphone.media = '(max-width: 414px)';
  smartphone.srcset = DBHelper.imageUrlForRestaurantSmall(restaurant);
  picture.append(smartphone);

  const image = document.createElement('img');
  image.className = 'restaurants-img';
  image.alt = `image from restaurant ${restaurant.name} in ${restaurant.neighborhood}`;
  image.src = DBHelper.imageUrlForRestaurantMedium(restaurant);
  picture.append(image);

  const header = document.createElement('header');
  header.className = 'restaurants-name';

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  
  header.append(name);
  article.append(header);

  const info = document.createElement('section');
  info.className = 'restaurants-info';

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  info.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  info.append(address);

  article.append(info);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.className = 'restaurants-more';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', `View Details from ${restaurant.name} in ${restaurant.neighborhood}`);
  article.append(more)

  return article
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

} 
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

