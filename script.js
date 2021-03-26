'use strict'




const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout {
    date = new Date();
    id = (Date.now() + '').slice(0, 10);
    clicks = 0;
    constructor(coords, distance, duration) {
        this.coords = coords; //Array of [latitudes,longitudes]
        this.distance = distance;
        this.duration = duration;
    }
    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
    click() {
        this.clicks++;
    }

}
class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this._calcPace();
        this._setDescription();
    }
    _calcPace() {
        //min/Km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout {
    type = 'cycling'
    constructor(coords, distance, duration, elevGain) {
        super(coords, distance, duration);
        this.elevGain = elevGain;
        this._calcSpeed();
        this._setDescription();
    }
    _calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}


//APPLICATION ARCHITECTURE
class App {
    //class Fields
    #map;
    #mapZoomLevel = 13;
    #mapEvent;
    #workouts = [];


    constructor() {
        //get user position
        this._getPosition();

        //get local storage
        this._getLocalStorage();

        //Add event handelers
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopUp.bind(this));

    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
            function () {
                alert("Cannot Get Location")
            });
    }

    _loadMap(pos) {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const coords = [latitude, longitude]
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);  //the 'map' is the id of the div where we want the map 
        //leaflet library displating map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        //handling clicks on map
        this.#map.on('click', this._showForm.bind(this));

        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        })
    }

    //mapE is the event happened when we click on map

    _showForm(mapE) {
        this.#mapEvent = mapE;  //#mapEvent saves the coords of the map and other stuff which is 
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    //HideMap
    _hideForm() {
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(function () {
            form.style.display = 'grid';
        }, 500)
    }



    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');  //closest parent having .form-row class is selected
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {  //formsubmitted
        e.preventDefault();

        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        const allPositive = (...inputs) => inputs.every(inp => inp > 0)

        //Get data from the form
        const type = inputType.value;
        const duration = +inputDuration.value;  //adding + changes it into a number
        const distance = +inputDistance.value;
        const coords = [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng];
        let workout;

        //if Running create running object
        if (type === 'running') {
            const cadence = +inputCadence.value
            //Check data validity
            if (!validInputs(duration, distance, cadence) || !allPositive(duration, distance, cadence))
                return alert("Inputs have to be positive numbers!");

            // (coords, distance, duration, cadence)
            workout = new Running(coords, distance, duration, cadence);

        }

        //if Cycling create cycling object
        if (type === 'cycling') {
            const elevGain = +inputElevation.value
            //Check data validity
            if (!validInputs(duration, distance, elevGain))
                return alert("Inputs have to be positive numbers!");


            // (coords, distance, duration, elevGain)
            workout = new Cycling(coords, distance, duration, elevGain);

        }

        //Add new object to workout to array
        this.#workouts.push(workout);
        // console.log(workout)


        //Render workout on map as marker
        this._renderWorkoutMarker(workout)


        //Render workout on list
        this._renderWorkoutList(workout);

        //Hide the form
        this._hideForm();




        //Clear inputs
        const inputs = [inputDistance, inputDuration, inputElevation, inputCadence];
        inputs.forEach(input => input.value = "")

        // console.log(mapEvent)

        //set workout in Local Storage
        this._setLocalStorage();

    }

    //Render Marker
    _renderWorkoutMarker(workout) {

        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxwidth: 250,
                minwidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            })
            )
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();
    }
    _renderWorkoutList(workout) {

        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        `;

        if (workout.type === 'running') {
            html = html + `
            <div class="workout__details">
                 <span class="workout__icon">⚡️</span>
                 <span class="workout__value">${workout.pace.toFixed(1)}</span>
                 <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                  <span class="workout__icon">🦶🏼</span>
                  <span class="workout__value">${workout.cadence}</span>
                 <span class="workout__unit">spm</span>
             </div>
      </li>
        ` ;
        }

        if (workout.type === 'cycling') {
            html = html + `
             <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;
        }

        //insert html as a sibling to form, because form should always appear at the top

        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopUp(e) {
        const workoutEl = e.target.closest('.workout');
        // console.log(workoutEl);

        if (!workoutEl) return;

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        // console.log(workout);

        this.#map.setView(workout.coords, this.#mapZoomLevel, {   //this method is part of leaflet libary, please read documentation.
            animate: true,
            pan: {
                duration: 1,
            }
        })
        // workout.click();
    }
    _setLocalStorage() {
        localStorage.setItem("workouts", JSON.stringify(this.#workouts))
    }
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));
        console.log(data)
        if (!data) return

        // data.forEach(work)

        this.#workouts = data;
        this.#workouts.forEach(work => {
            this._renderWorkoutList(work);


        })

    }
    reset() {
        localStorage.removeItem('workouts');
        location.reload()
    }
}
const app = new App();




