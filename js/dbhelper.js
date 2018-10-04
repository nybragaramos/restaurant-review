/**
 * Common database helper functions.
 */
//const BASE_URL = 'https://nybragaramos.github.io/restaurant-review';
let restaurantsDB = [];
class DBHelper {


  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  /*static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
    return `${BASE_URL}/data/restaurants.json`;
  }
*/
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    if(restaurantsDB.length == 0){
     // Fetch all restaurants
     firebase.database().ref('restaurants').once('value', function(snapshot) {     
        restaurantsDB = snapshot.val();
        callback(null, restaurantsDB);
      }, function(error) {
        callback(error, null);
      });
    } else {
      callback(null, restaurantsDB);
    }
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {

     // Fetch all reviews
     firebase.database().ref('reviews').on('value', function(snapshot) {     
        callback(null, snapshot.val());
      }, function(error) {
        callback(error, null);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  static fetchReviewsById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, reviews.find(r => r.id == id));
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {

    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
    /*return (`${BASE_URL}/restaurant.html?id=${restaurant.id}`);*/
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `img/${restaurant.id}.jpg`;
    /*return (`${BASE_URL}/img/${restaurant.photograph}`);*/
  }

  static imageUrlForRestaurantSmall(restaurant) {
    return `img/small/${restaurant.photograph}`;
    /*return (`${BASE_URL}/img/small/${restaurant.photograph}`);*/
  }

  static imageUrlForRestaurantMedium(restaurant) {
    return `img/medium/${restaurant.photograph}`;
    /*return (`${BASE_URL}/img/medium/${restaurant.photograph}`);*/
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  static initFirebase(){
  try {
    firebase.initializeApp({
    apiKey: "AIzaSyB7FsjinoYLISVk8g43GzY7_avpzJhpFxE",
    authDomain: "restaurant-reviews-ab33f.firebaseapp.com",
    databaseURL: "https://restaurant-reviews-ab33f.firebaseio.com",
    projectId: "restaurant-reviews-ab33f",
    storageBucket: "",
    messagingSenderId: "811582858998"
    });

}
catch(err) {
    document.getElementById("demo").innerHTML = err.message;
}
    return;
  //}
  
}
}