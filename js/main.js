/*
var map = L.map('myMap').setView([35.6, 135.8], 5);

//add tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "City": "Tokyo",
        "Pop_1985": 30.30,
        "Pop_1990": 32.53,
        "Pop_1995": 33.59,
        "Pop_2000": 34.45,
        "Pop_2005": 35.62,
        "Pop_2010": 36.83,
        "Pop_2015": 38
    },
    "geometry":{
        "type": "Point",
        "coordinates": [139.8089447, 35.6832085]
    }
}
L.geoJson(geojsonFeature).addTo(map)

// In this updated onEachFeature function, a loop is used to iterate through all the properties in the feature.properties object.
// For each property, a new <li> element is created with the property name as the <strong> tag and the property value. 
//The elements are then appended to a <ul> element to create a list of all the properties and their values. 
//Finally, the bindPopup method is called with the popupContent variable as the argument.

function onEachFeature(feature, layer) {
    var popupContent = "<ul>";
    for (var prop in feature.properties) {
        popupContent += "<li><strong>" + prop + ":</strong> " + feature.properties[prop] + "</li>";
    }
    popupContent += "</ul>";
    layer.bindPopup(popupContent);
}
    
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);
*/


// Loading MegaCities.geojson data with AJAX and adding it to a Leaflet map

/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('myMap', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);

    //call getData function
    getData();
};

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p><strong>" + property + ":</strong> " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/gdp.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){            
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: '#E180B2',
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },  onEachFeature: onEachFeature
            }).addTo(map);
        });
};

document.addEventListener('DOMContentLoaded',createMap)

