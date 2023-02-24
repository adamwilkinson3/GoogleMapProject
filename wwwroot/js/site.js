// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

let requestOptions = {
    method: 'GET',
};
let map;
let marker;
let postLoc = {};

fetch("https://api.geoapify.com/v1/ipinfo?&apiKey=d655216b0c454a568afacd1e0ff55cb9", requestOptions)
    .then(response => response.json())
    .then(result => window.initMap = initMap(result.location))
    .catch(error => console.log('error', error));

function initMap(loc) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: loc.latitude, lng: loc.longitude },
        zoom: 8,
    });

    const geocoder = new google.maps.Geocoder();
    const infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(map, 'click', function (event) {
        placeMarker(event.latLng);
        geocodeLatLng(geocoder, map, infowindow, event.latLng);
        $('#locOutput').html(`Location</br>Latitude: ${event.latLng.lat()}</br>Longitude: ${event.latLng.lng()}`);
    });
}

function placeMarker(location) {
    marker?.setMap(null);
    marker = new google.maps.Marker({
        position: location,
        map: map
    });
}

function geocodeLatLng(geocoder, map, infowindow, loc) {
    geocoder
        .geocode({ location: loc })
        .then((response) => {
            if (response.results[0]) {
                infowindow.setContent(response.results[0].formatted_address);
                infowindow.open(map, marker);

                postLoc.address = response.results[0].formatted_address;
                postLoc.lat = loc.lat();
                postLoc.long = loc.lng();


            } else {
                window.alert("No results found");
            }
        })
        .catch((e) => window.alert("Geocoder failed due to: " + e));
}

function postLocation(postLoc) {
    let requestPost =
    {
        method: 'POST',
        body: JSON.stringify(
            {
                address: postLoc.address.toString(),
                latitude: postLoc.lat,
                longitude: postLoc.long
            }),
        headers:
        {
            'Content-Type': 'application/json; charset=UTF-8',
        },
    }

    let fdata = fetch('https://mapprojapi.azurewebsites.net/api/map', requestPost)
        .then((response) => response.json())
        .then((data) => { console.log(data); $('#locOutput').html(`Location</br>Latitude: ${data.data.latitude}</br>Longitude: ${data.data.longitude}</br>Stored in Database`); })
}

document.getElementById("submitLoc").addEventListener("click", () => postLocation(postLoc));
