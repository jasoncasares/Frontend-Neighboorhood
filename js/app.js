
//List of locations that binds to search
var locationData = [
  {
    locationName: 'Intelligentisa Coffee',
    latLng: {lat: 33.990981, lng: -118.466844},
  }, 
  {
    locationName: 'Blue Bottle Coffee',
    latLng: {lat: 33.991963, lng: -118.470312},
  }, 
  {
    locationName: 'Lemonade',
    latLng: {lat: 33.989347, lng: -118.462450},
  }, 
  {
    locationName: 'Gjelina Take Away',
    latLng: {lat: 33.990590, lng: -118.464999},
  }, 
  { 
    locationName: 'The Tasting Kitchen',
    latLng: {lat: 33.989701, lng: -118.463117}   
  }
];

//Google Maps
var ViewModel = function() {
  var self = this;

  //Google Map object
	self.googleMap = new google.maps.Map(document.getElementById('map'), {
  	center: {lat: 33.991, lng: -118.467},
  	zoom: 17 
  });

  //Build place objects
  self.allLocations = [];
  locationData.forEach(function(place) {
    self.allLocations.push(new Place(place));
  });

  // Build markers
  self.allLocations.forEach(function(place) {
    var markerOptions = {
      map: self.googleMap,
      position: place.latLng,
      animation: google.maps.Animation.DROP
    };
    
    // Create Marker
    place.marker = new google.maps.Marker(markerOptions);

    //Add event listener for each marker
    place.marker.addListener('click', function() {
      self.clickHandler(place);
    });

    // Use Fit Bounds to optimize for mobile device
    //var bounds = new google.maps.LatLngBounds();
    //bounds.extend(place.latLng);
    //map.fitBounds(bounds);
    //map.setCenter(bounds.getCenter());
  });

  //Constructor Place function for each location
  function Place(data) {
    this.name = data.name;
    this.latLng = data.latLng;
    this.marker = ko.observable(data.marker);
    
    //Populated by Foursquare API
    this.url = null;
    this.address = null;
    this.apiError = null;
    this.phone = null;

  }

  //Create info window
  self.infowindow = new google.maps.InfoWindow();
  
  self.infowindow.addListener('closeclick', function() {
  });

  //Click Handler function
  self.clickHandler = function(place) {

    self.infowindow.setContent(self.contentBox(place));

    self.infowindow.open(self.googleMap, place.marker);

    (function() {
      if (place.marker.getAnimation() !== null) {
        place.marker.setAnimation(null);
      } else {
        place.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          place.marker.setAnimation(null);
        }, 700); // Default timeout that Google Maps uses for it's markers
      }
    })();
  };

  //Info Window content
  self.contentBox = function(venue) {
    var details = [place.name, place.address, place.phone, place.url, place.apiError];
  };
  

  //Foursquare API//
  (function() {
    self.allLocations.forEach(function(place) {
      var config = {
        clientID: '2BXJM3E525UGVMQZQ4SWPUHQIYWSSZAERKE3BAMDEASTSWOB',
        clientSecret: 'AWMNY1RNLJQJNZKAO3EJAOD5E135QJPJ5ERKQJ32DIKXUUX4',
        apiUrl: 'https://api.foursquare.com/v2/venues/search',
        authUrl: 'http://foursquare.com/',
        version: 'v=20160304',
        error: 'Foursquare API could not be used'
      };
      //AJAX request
      $.ajax({
        url: config.apiUrl,
        data: 'client_id=' + config.clientID + '&' + 'client_secret=' + config.clientSecret + '&' + config.version + '&' + 'll=' + place.latLng.lat + ',' + place.latLng.lng,
        dataType: 'json',

        //Put Foursquare response into variable
        success: function(data) {
          results = data.response.venues;

          // Make names lowercase
          originalName = venue.name.toLowerCase();
          foursquareName = results[i].name.toLowerCase();

          for (var i = 0; i <results.length; i++) {
            // Venue validation
            if (foursquareName === originalName) {
              name = results[i].name;
              place.url = results[i].url;
              place.phone = results[i].contact.formattedPhone;
              place.address = results[i].location.address;
            }
          }
        },
        //Error
        error: function(data) {
          place.apiError = config.error;
        }
      });
    });
  })();

  //Array KO
  self.visibleLocations = ko.observableArray();
  
  
 //View Places
  self.allLocations.forEach(function(place) {
    self.visibleLocations.push(place);
  });

  //Store User Input
  self.userInput = ko.observable('');
  
  
  // filter markers based on user input to see if it matches list
  self.filterMarkers = function() {
    var searchInput = self.userInput().toLowerCase();
    
    self.visiblePLocations.removeAll();
    
    // Name of place then determine if visible by user input
    self.allLocations.forEach(function(place) {
      place.marker.setVisible(false);
      
      if (place.locationName.toLowerCase().indexOf(searchInput) !== -1) {
        self.visibleLocations.push(place);
      }
    });
    
    
    self.visibleLocations().forEach(function(place) {
      place.marker.setVisible(true);
    });
  };
  
};

function initMap() {
ko.applyBindings(new ViewModel());
}

//Google Maps error when maps is down
function googleError() {
  alert("google API unavailable");
}