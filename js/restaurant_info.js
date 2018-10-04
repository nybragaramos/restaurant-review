let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.initFirebase();
  initMap();
  fetchReviewsFromURL();
  $('header').load('header.html'); 
  $('footer').load('footer.html'); 
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map-details', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Get current restaurant from page URL.
 */
fetchReviewsFromURL = (callback) => {
  if (self.reviews) { // restaurant already fetched!
    callback(null, self.reviews)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchReviewsById(id, (error, reviews) => {
    if (error) { // Got an error!
      console.error(error);
      return;
    }
      self.reviews = reviews.reviews;
      fillReviewsHTML();
      return;
  });
  }
}
/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  $('.restaurant-name').html(restaurant.name);

  $('.restaurant-address').html(restaurant.address);


  const tablet = document.createElement('source');
  tablet.media = '(min-width: 450px) and (max-width: 569px)';
  tablet.srcset = DBHelper.imageUrlForRestaurantMedium(restaurant);
  $('#restaurant-picture').append(tablet);

  const smartphone = document.createElement('source');
  smartphone.media = '(max-width: 449px)';
  smartphone.srcset = DBHelper.imageUrlForRestaurantSmall(restaurant);
  $(tablet).after(smartphone);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = `image from restaurant ${restaurant.name} in ${restaurant.neighborhood}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  $(smartphone).after(image);

  $('.restaurant-cuisine').html(restaurant.cuisine_type);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  for (let key in operatingHours) {
    $('.restaurant-open').append(`<p class='restaurant-days'>${key}</p>
      <p class='restaurant-hours'>${operatingHours[key]}</p>`);  
  }
}


/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  if (!reviews) {
    $('#reviews-container').append('<p>No reviews yet!</p>');
    return;
  }
  const ul = $('#reviews-list');
  reviews.forEach(review => {
    $(ul).append(createReviewHTML(review));
  });
  $('#reviews-container').append(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.className = 'reviews-list-item';

  const name = document.createElement('p');
  name.className = 'review-name';
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.className = 'review-date';
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'review-rate';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'review-comment';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  $('#breadcrumb').append(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
