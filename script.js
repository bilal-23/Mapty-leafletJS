'use strict'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



navigator.geolocation.getCurrentPosition(function (pos) {

    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    const coords = [latitude, longitude]

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
    const map = L.map('map').setView(coords, 13);  //the 'map' is the id of the div where we want the map 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(coords).addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();

    map.on('click', function (mapEvent) {
        // console.log(mapEvent)
        const coords = [mapEvent.latlng.lat, mapEvent.latlng.lng];
        L.marker(coords).addTo(map)
            .bindPopup(L.popup({
                maxwidth: 250,
                minwidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup',
            })
            )
            .setPopupContent('Workout')
            .openPopup();
    })
}, function () {
    alert("Cannot Get Location")
});
