
//List of locations that binds to search'
//'use strict';
var locationData = [
  {
    name: 'Intelligentsia Coffee & Tea',
    latLng: {lat: 33.990981, lng: -118.466844},
  }, 
  {
    name: 'Blue Bottle Coffee',
    latLng: {lat: 33.991963, lng: -118.470312},
  }, 
  {
    name: 'Lemonade Venice',
    latLng: {lat: 33.989347, lng: -118.462450},
  }, 
  {
    name: 'Gjelina',
    latLng: {lat: 33.990590, lng: -118.464999},
  }, 
  { 
    name: 'The Tasting Kitchen',
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
      title: place.name,
      animation: google.maps.Animation.DROP
    };
    
    // Create Marker
    place.marker = new google.maps.Marker(markerOptions);

    //Add event listener for each marker
    place.marker.addListener('click', function() {
      self.clickHandler(place);
    });
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

  //Link list view to marker when user clicks list element
  self.itemClick = function(marker) {
    google.maps.event.trigger(this.marker, 'click');
  };

  //Create info window
  self.infowindow = new google.maps.InfoWindow();
  
  self.infowindow.addListener('closeclick', function() {
  });

  //Click Handler function
  self.clickHandler = function(place) {

    contentString = '<h4>' + place.name + '</h4>\n<p>' + place.address + '</p>\n<p>' + place.phone + '</p><a href= ' + place.url + '>' + place.url + '</a>'; 
    self.infowindow.setContent(contentString);

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

          for (var i = 0; i < results.length; i++) {

          // Make names lowercase
          originalName = place.name.toLowerCase();
          foursquareName = results[i].name.toLowerCase();

            // Venue validation
            if (foursquareName === originalName) {
              name = results[i].name;
              place.url = results[i].url;
              place.phone = results[i].contact.formattedPhone || 'No Phone Number';
              place.address = results[i].location.address;
            }
          }
        },
        //Error
        error: function(jqXHR, exception) {
          var msg = 'Foursquare API could not be used';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        $('#post').html(msg);
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
    
    self.visibleLocations.removeAll();

    // Close info window when using search function
    self.infowindow.close();
    
    // Name of place then determine if visible by user input
    self.allLocations.forEach(function(place) {
      place.marker.setVisible(false);
      
      if (place.name.toLowerCase().indexOf(searchInput) !== -1) {
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