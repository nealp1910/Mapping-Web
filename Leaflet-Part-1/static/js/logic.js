// Part 1: Create the Earthquake Visualization 
// Data Source: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php

// Defining the link 
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Store our API endpoint inside queryUrl
// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function popUpMsg(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr>Time of Earthquake: " + new Date(feature.properties.time) + 
        "</h3><hr>Magnitude of Earthquake: " + feature.properties.mag + 
        "</h3><hr>Depth of Earthquake: " + feature.geometry.coordinates[2]);
}

// Define streetmap and darkmap layers
var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1
 });

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18
});

// Define a baseMaps object to hold our base layers
 var baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
};

// Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [ 37.09, -95.71 ],
    zoom: 5,
    layers: [streetmap]
});

// Add streetmap tile to map
streetmap.addTo(myMap);

// Create layer
var earthquakes = new L.LayerGroup();

// Create overlay object to hold our overlay layer
var overlayMaps = {
    Earthquakes: earthquakes
}

// Create a layer control
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Function to create legend
function getColor(depth) {
    return depth > 90 ? '#ff0000' :
           depth > 70 ? '#e35a03' :
           depth > 50 ? '#c89c06' :
           depth > 30 ? '#94ae07' :
           depth > 10 ? '#489409' : '#117b09';
  }
  
  // Add it to map
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (myMap) {

      var div = L.DomUtil.create('div', 'info legend'),
      depth_grades = [-10, 10, 30, 50, 70, 90];
      labels = [];
  
      // Loop through each interval 
      for (var i = 0; i < depth_grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(depth_grades[i] + 1) + '"></i> ' +
              depth_grades[i] + (depth_grades[i + 1] ? '&ndash;' + depth_grades[i + 1] + '<br>' : '+');
      }
      return div;
  };
  
  legend.addTo(myMap);

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  geojsonLayer = L.geoJSON(data, {
    style: function(feature) {
      return {
        fillColor: getColor(feature.geometry.coordinates[2]),
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 0.9
      };
    },
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        radius: feature.properties.mag * 5, 
        fillOpacity: 0.9
      });
  },
    onEachFeature: popUpMsg,
    
  }).addTo(earthquakes);

  earthquakes.addTo(myMap);
});