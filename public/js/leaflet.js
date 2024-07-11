var map = L.map('map').setView([coordinates[1],coordinates[0]], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// console.log("accessible");

//  console.log(user);

var marker = L.marker([coordinates[1],coordinates[0]]).addTo(map);
  marker.bindPopup("<b>Hey there!</b><br>You Will be here soon!!.").openPopup();