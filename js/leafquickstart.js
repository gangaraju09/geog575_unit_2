function initialize(){
	mainMap = map();
	polygon(mainMap)
	circle(mainMap)
	marker(mainMap)
	mainMap.on('click', onMapClick);
	
	
}

function map(){

var map = L.map('myMap').setView([51.505, -0.09], 13); 

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map)
 
return map

}

function circle(map){
	var circle = L.circle([51.508, -0.11], {
		color: 'red',
		fillColor: '#f03',
		fillOpacity: 0.5,
		radius: 500
	}).addTo(map);
	circle.bindPopup("I am a circle.");
	return circle
}

function marker(map){
	var marker = L.marker([51.5, -0.09]).addTo(map)
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
	return marker
}

function polygon(map){
	var polygon = L.polygon([
		[51.509, -0.08],
		[51.503, -0.06],
		[51.51, -0.047]
	]).addTo(map);
	polygon.bindPopup("I am a polygon.");
	return polygon
	
}

function onMapClick(e) {
	alert("You clicked the map at " + e.latlng);
}


document.addEventListener('DOMContentLoaded',initialize)

