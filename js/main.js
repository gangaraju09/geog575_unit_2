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
var dataStats= {};
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
	maxZoom: 10,
    }).addTo(map);    

    L.control.scale({
        position: 'topleft'
    }).addTo(map)
 

    
    //call getData function
    getData(map);

    document.getElementById('h1').innerHTML =  'GDP Evolution across World (1980 - 2020)'; 
    document.getElementById('credits').innerHTML = "<p> <b>Gross Domestic Product (GDP)</b> is the total value of goods and services produced within a country's borders in a given period of time, used as an economic indicator for a country's economic performance. | "+ ""+ " Data Source: <a href = 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG'> World Bank Data </a> | "+ " "+ "Credits: Gareth Baldrica-Franklin, RCS Sidhharth</p>" 

    
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
    var minRadius = 1.25;
    // conditional statement for Not available values
    if (attValue === 'Na') {
        // assign radius of 1 for zero attribute values
        return minRadius = 2;
    }else{
        var radius = 1.0083 * Math.pow(Math.abs(attValue)/minValue,0.5715) * (minRadius);
        return radius;
    }
    
};
// create a function to differentiate values between negative and positive with color variation
function fillColor(feature, attribute){
    if ( Number(feature.properties[attribute]) > 0){
        return "#43a2ca";
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
        color: "#ffffff",
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
    popupContent += "<p><b>Capital:</b> " + feature.properties.Capital + "</p>";

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
    var year = attribute.split("_")[1];
        //update temporal legend
    document.querySelector("span.year").innerHTML = year + " to " +( Number(year) +5);
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
           if (props[attribute] != 'Na')
               popupContent += "<p><b>GDP in " + year + ":</b> " + props[attribute] + " percent</p>";
            else
                popupContent += "<p><b>GDP in " + year + ":</b> " + 'No Data' + "</p>";

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


/*function createSequenceControls(attributes){

    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="assets/noun-reverse-3476075.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="assets/noun-forward-3476045.png"></button>'); 

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });

    map.addControl(new SequenceControl());    // add listeners after adding control

    // set slider attributes
    document.querySelector(".range-slider").max = 7;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    // add step buttons
    document.querySelector('#sequence-control-container').insertAdjacentHTML('beforeend', '<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#sequence-control-container').insertAdjacentHTML('beforeend', '<button class="step" id="forward">Forward</button>');

    // add element to display value
    document.querySelector('#panel').insertAdjacentHTML('beforeend', "<p id='slider-value'></p>");
    document.getElementById('#panel').innerHTML += '<p style="color: #43a2ca;">Click forward and Reverse sequence button to view GDP values over different Time periods</p>'

    // replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend', "<img src='assets/noun-reverse-3476075.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend', "<img src='assets/noun-forward-3476045.png'>")
   
    // set up event listeners for buttons
    var steps = document.querySelectorAll('.step');

    steps.forEach(function (step) {
        step.addEventListener("click", function () {
            var index = document.querySelector('.range-slider').value;

            if (step.id == 'forward') {
                index++;
                index = index > 7 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                index = index < 0 ? 7 : index;
            };

            // update slider and value display
            updateSlider(index, attributes);

            // pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })

    // set up event listener for range slider
    var slider = document.querySelector('.range-slider');

    slider.addEventListener("input", function () {
        var index = slider.value;
        // update slider and value display
        updateSlider(index, attributes);
        // pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
}

function updateSlider(index, attributes) {
    // update slider
    var year = 1980
    var updateYear = year + (index * 5)
    document.querySelector('.range-slider').value = index;

    // update slider value display
    document.querySelector('#slider-value').textContent = "Year: " + updateYear + " " + "-" + " " + (updateYear + 5);
}

*/

function createSequenceControls(attributes) {

    var SequenceControl = L.Control.extend({
      options: {
        position: 'bottomleft'
      },
  
      onAdd: function() {
        // create the control container div with a particular class name
        var container = L.DomUtil.create('div', 'sequence-control-container');
  
        //create range input element (slider)
        container.innerHTML += '<input class="range-slider" type="range">';
  
        container.innerHTML += '<button class="step" id="reverse" title="Reverse"><img src="assets/noun-reverse-3476075.png"></button>'; 
        container.innerHTML += '<button class="step" id="forward" title="Forward"><img src="assets/noun-forward-3476045.png"></button>'; 
  
        //disable any mouse event listeners for the container
        L.DomEvent.disableClickPropagation(container);
  
        return container;
      }
    });
  
    map.addControl(new SequenceControl());    // add listeners after adding control
  
    // set slider attributes
    var slider = document.querySelector(".range-slider");
    slider.max = 7;
    slider.min = 0;
    slider.value = 0;
    slider.step = 1;
  
    // add element to display value
    var panel = document.getElementById('panel');
    panel.innerHTML += "<p id='slider-value'></p>";
    panel.innerHTML += "<p style='color: #30a1d1; text-align: center;'>Click forward and Reverse sequence button on the MAP to view GDP values over different Time periods</p>";

  
    // replace button content with images
    //document.querySelector('#reverse').innerHTML += "<img src='assets/noun-reverse-3476075.png'>";
    //document.querySelector('#forward').innerHTML += "<img src='assets/noun-forward-3476045.png'>";
  
    // set up event listeners for buttons
    var steps = document.querySelectorAll('.step');
  
    steps.forEach(function(step) {
      step.addEventListener("click", function() {
        var index = slider.value;
  
        if (step.id == 'forward') {
          index++;
          index = index > 7 ? 0 : index;
        } else if (step.id == 'reverse') {
          index--;
          index = index < 0 ? 7 : index;
        };
  
        // update slider and value display
        updateSlider(index, attributes);
  
        // pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
      })
    })
  
    // set up event listener for range slider
    slider.addEventListener("input", function() {
      var index = slider.value;
      // update slider and value display
      updateSlider(index, attributes);
      // pass new attribute to update symbols
      updatePropSymbols(attributes[index]);
    });
  }
  
  function updateSlider(index, attributes) {
    // update slider
    var year = 1980;
    var updateYear = year + (index * 5);
    var slider = document.querySelector('.range-slider');
    slider.value = index;

    // update slider value display
   // document.querySelector('#slider-value').textContent = "Year: " + updateYear + " " + "-" + " " + (updateYear + 5);
  
  }  
// creatinf legend values
  function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 1980; year <= 2020; year+=5){
              //get population for current year
              var value = city.properties["GDP_"+ String(year)];
              if (Number(value)>0){
                //add value to array
                allValues.push(value);

              }
              
        }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

    console.log(dataStats.min, dataStats.max, dataStats.mean)

} 

//calculate the radius of each proportional symbol
function calcPropRadiusLegend(attValue) {
    console.log(attValue)
    //constant factor adjusts symbol sizes evenly
    var minRadius = 1.25;
    // conditional statement for Not available values
    if (attValue === 'Na') {
        // assign radius of 1 for zero attribute values
        return minRadius = 2;
    }else{
        var radius = 1.0083 * Math.pow(Math.abs(attValue)/minValue,0.5715) * (minRadius);
        console.log(radius)
        return radius;
       
    }
    
};

// Creating legend on the map

function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
            container.innerHTML = '<p class = "temporalLegend"> GDP between <span class = "year"> 1980         <span class = "updateYear"</span></span></p>'

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string  
            for (var i=0; i<circles.length; i++){  

                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadiusLegend(dataStats[circles[i]]);  
                var cy = 59 - radius;  

                //circle string  
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#43a2ca" fill-opacity="0.8" stroke="#ffffff" cx="30"/>';  

                var textY = i * 20 + 20;            

            //text string            
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " % change" + '</text>';
            };

            

            //close svg string  
            svg += "</svg>";

            //add attribute legend svg to container
            container.innerHTML += svg;

            return container;
        }

    });

    map.addControl(new LegendControl());
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
            calcStats(json);
            // Create proportional symbols for each feature using the createPropSymbols function
            createPropSymbols(json, attributes);
            // Create the sequence controls using the createSequenceControls function
            createSequenceControls(attributes);

            createLegend(attributes);
        })
};

// This code listens for the DOMContentLoaded event and calls the createMap function
document.addEventListener('DOMContentLoaded',createMap)


