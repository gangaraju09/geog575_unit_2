/*
//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//Step 1. Create the Leaflet map--already done in createMap()
//Step 2. Import GeoJSON data--already done in getData()
//Step 3. Add circle markers for point features to the map--already done in AJAX callback
//Step 4. Determine the attribute for scaling the proportional symbols
//Step 5. For each feature, determine its value for the selected attribute
//Step 6. Give each feature's circle marker a radius based on its attribute value

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
// create a Maop and minValue in global Space
var map;
var minValue;
//function to initilaize the Leaflet map
function createMap(){
    //create the map
    map = L.map('myMap', {
        center: [20, 0],
        zoom: 2
    });

    //add base map tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
    }).addTo(map);

    //call getData function
    getData(map);

    
};
// create a function to perform calculation for the min value of GDP data
function calcMinValue(data){
    // create an empty array to store all data values with all numbers
    var allValues = [];
    
    // loop through each city in the data
    for(var city of data.features){
        // loop through each year from 1980 to 2015, incrementing by 5
        for(var year = 1980; year <= 2015; year+=5){
            // get the GDP value for the current city and year
            var value = city.properties["GDP_"+ String(year)];
            
            // add the absolute value of the GDP to the array only if it is not "Na"
            if (value != "Na") {
                allValues.push(Math.abs(value));    
            }
        }
    }
    
    // get the minimum value of the array
    var minValue = Math.min(...allValues);

    // return the minimum value
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 1;
    // conditional statement for Not available values
    if (attValue === 'Na') {
        // assign radius of 1 for zero attribute values
        return minRadius = 3;
    }else{
        var radius = 1.0083 * Math.pow(Math.abs(attValue)/minValue,0.5715) * (minRadius);
        return radius;
    }
    
};
// create a function to differentiate values between negative and positive with color variation
function fillColor(feature, attribute){
    if ( Number(feature.properties[attribute]) > 0){
        return "#ff7800";
    }
    else if ( Number(feature.properties[attribute]) < 0){
        return "#ff0000";
    }
    else{
        return "#000000";
    }
}


function pointToLayer(feature, latlng, attributes){
    
    // get the first attribute from the attributes array
    var attribute = attributes[0];

    // set the initial options for the circle markers
    var options = {
        fillColor: fillColor(feature, attribute),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // get the value of the current attribute from the feature properties
    var attValue = Number(feature.properties[attribute]);

    // calculate the radius of the circle markers based on the attribute value
    options.radius = calcPropRadius(attValue);

    // create a new circle marker layer with the specified options
    var layer = L.circleMarker(latlng, options);

    // create the content for the popup window that appears when the user clicks on the circle marker
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p>";

    // extract the year from the attribute name and add the GDP data for that year to the popup content
    var year = attribute.split("_")[1];
    popupContent += "<p><b>GDP in " + year + ":</b> " + feature.properties[attribute] + " percent</p>";

    // bind the popup content to the circle marker layer, with an offset to ensure the popup is centered over the circle marker
    layer.bindPopup(popupContent, {
          offset: new L.Point(0,-options.radius)
      });

    // return the circle marker layer
    return layer;
};

// create a function for proportional symbols
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
      
        if (layer.feature && layer.feature.properties[attribute]){
          //access feature properties
           var props = layer.feature.properties;

           //update each feature's radius based on new attribute values
           var radius = calcPropRadius(props[attribute]);
           layer.setRadius(radius);

           layer.setStyle({
                fillColor: fillColor(layer.feature, attribute)
           })

           //add city to popup content string
           var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

           //add formatted attribute to panel content string
           var year = attribute.split("_")[1];
           popupContent += "<p><b>GDP in " + year + ":</b> " + props[attribute] + " percent</p>";

           //update popup with new content
           popup = layer.getPopup();
           popup.setContent(popupContent).update();

        };
    });
};

//Determine the attribute for scaling the proportional symbols

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("GDP") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};


//Step 1: Create new sequence controls
function createSequenceControls(attributes){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 7;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');

    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='assets/reverse.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='assets/forward.png'>")
    document.getElementById('panel').innerHTML += '<p style="color: white;">Click forward or Reverse buttons to change time period for 5 years</p>'

    var steps = document.querySelectorAll('.step');

    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 7 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 7 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;

            //Step 9: pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })

    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        // get the new index value
        var index = this.value;

        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
};

// This function retrieves data from a GeoJSON file and processes it using several other functions
function getData(map){
    
    // Use the Fetch API to get the GeoJSON data
    fetch("data/gdp.geojson")
        .then(function(response){
            // Convert the response to a JSON object
            return response.json();
        })
        .then(function(json){
            // Process the JSON data using the processData function and store the resulting attributes and the minimum value
            var attributes = processData(json);
            minValue = calcMinValue(json);
            // Create proportional symbols for each feature using the createPropSymbols function
            createPropSymbols(json, attributes);
            // Create the sequence controls using the createSequenceControls function
            createSequenceControls(attributes);
        })
};

// This code listens for the DOMContentLoaded event and calls the createMap function
document.addEventListener('DOMContentLoaded',createMap)


