
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

    // Use Fit Bounds to optimize for mobile device
    //var bounds = new google.maps.LatLngBounds();
    //bounds.extend(place.latLng);
    //map.fitBounds(bounds);
    //map.setCenter(bounds.getCenter());

    //Create info window
    var contentString;
    self.infowindow = new google.maps.InfoWindow({
      content: contentString
    });

  });

  //Constructor Place Variable
  var Place = function(data) {
    this.name = data.locationName;
    this.latLng = data.latLng;
    this.marker = ko.observable(data.marker);
  };

  //Foursquare API//
  var clientID = "2BXJM3E525UGVMQZQ4SWPUHQIYWSSZAERKE3BAMDEASTSWOB";
  var clientSecret = "AWMNY1RNLJQJNZKAO3EJAOD5E135QJPJ5ERKQJ32DIKXUUX4";
  var foursquareURL = 'https://api.foursquare.com/v2/venues/search?limit=1&ll=' + place.latLng.lat + ',' + place.latLng.lng + '&client_id=' + clientID + '&client_secret='+ clientSecret + '&v=20160226';
  var results, name, url, street, city;
 
  $.getJSON(foursquareURL, function(data){
    results = data.response.venues[0],
    place.name = results.name,
    place.url= results.hasOwnProperty('url') ? results.url : '';
    place.street = results.location.formattedAddress[0],
    place.city = results.location.formattedAddress[1];

  //Error
  }).fail(function() { alert("Sorry Charlie! Something's wrong!");});
  
  //add click listener 
  place.marker.addListener('click', function(){

    //Timeout
    place.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ place.marker.setAnimation(null); }, 1400);
    contentString = '<h4>' + place.name + '</h4>\n<p>' + place.street + '</p>\n<p>' + place.city + '</p><a href= ' + place.url + '>' + place.url + '</a>';   
    //open info window with content
    self.infowindow.setContent(contentString);
    self.infowindow.open(self.googleMap, place.marker);
    setTimeout(function() {self.infowindow.open(null);}, 7000);

  });

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
  
  
  function Place(dataObj) {
    this.locationName = dataObj.locationName;
    this.latLng = dataObj.latLng;
    
    // You will save a reference to the Places' map marker after you build the
    // marker:
    this.marker = null;
  }
  
};

function initMap() {
ko.applyBindings(new ViewModel());
}

//Google Maps error when maps is down
function googleError() {
  alert("google API unavailable");
};