const address = document.querySelector("#address");
const cityTable = document.querySelector('#city-name');
const latTable = document.querySelector('#city-lat');
const longTable = document.querySelector('#city-long');


// shows the city address on web application
const showAddress = (lat, lon, name) => {
  if (name) {
    cityTable.innerHTML = name;
    latTable.innerHTML = lat;
    longTable.innerHTML = lon;

  } else {
    cityTable.innerHTML = "Not Found, Search Again!";
  }
}


// shows the leaflet map widget on the web application
const showMap = (lat, lon, name) => {
  let mapDisplay = L.map("map").setView([lat, lon], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapDisplay);

  let marker = L.marker([lat, lon])
    .addTo(mapDisplay)
    .bindPopup(`<b>Detail Location</b><br>${name}`);
}


// shows today's forecast on the web application
const showTodaysWeather = (lon, lat, cityName) => {
  let queryURL = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lat=' + lat + '&lon=' + lon + '&appid=' + '45f42fe1e7919a2ec27993b0a0b90a7e';
  fetch(queryURL, {
    method: 'GET'
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let todayWeatherCity = document.getElementById('today-weather-city');
      let unixTime = data.dt;
      let unixToHour = dayjs.unix(unixTime).format('h:mm a, MMM D, YYYY');

      todayWeatherCity.textContent = cityName + " (" + unixToHour + ")";
      let currentHour = document.getElementById('current-hour');

      let actualTemp = document.getElementById('temp');
      actualTemp.textContent = 'Temp: ' + data.main.temp + ' °C';
      let feelsLikeTemp = document.getElementById('feels-like');
      feelsLikeTemp.textContent = 'Feels like: ' + data.main.feels_like + ' °C';
      let weatherDescription = document.getElementById('description');
      weatherDescription.textContent = data.weather[0].description;
      let windSpeed = document.getElementById('wind');
      windSpeed.textContent = 'Wind Speed: ' + data.wind.speed + ' km/h';
      let humidity = document.getElementById('humidity');
      humidity.textContent = 'Humidity: ' + data.main.humidity + "%";
    });

};


// shows the five day forecast on the web application
const showFiveDayForecast = (lon, lat) => {
  let queryURL = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=' + lat + '&lon=' + lon + '&appid=' + '45f42fe1e7919a2ec27993b0a0b90a7e';

  fetch(queryURL, {
    method: 'GET'
  })
    .then(function (response) {
      return response.json();
    }).then(function (data) {

      let daysList = data.list;
      let dayCounter = 1;

      for (let i = 7; i < 40; i += 8) {
        let unixTime = daysList[i].dt;
        let unixToHour = dayjs.unix(unixTime).format('MMM D');
        let hour = document.getElementById('day' + dayCounter);
        hour.textContent = unixToHour;

        let actualTemp = document.getElementById('temp' + dayCounter);
        actualTemp.textContent = 'Temp: ' + daysList[i].main.temp + ' °C';
        let windSpeed = document.getElementById('wind' + dayCounter);
        windSpeed.textContent = 'Wind Speed: ' + daysList[i].wind.speed + ' km/h';
        let humidity = document.getElementById('humidity' + dayCounter);
        humidity.textContent = 'Humidity: ' + daysList[i].main.humidity + '%';
        let weatherDescription = document.getElementById('description' + dayCounter);
        weatherDescription.textContent = daysList[i].weather[0].description;
        let feelsLikeTemp = document.getElementById('feels-like' + dayCounter);
        feelsLikeTemp.textContent = 'Feels like: ' + daysList[i].main.feels_like + ' °C';

        dayCounter++;
      };

    });
};

// renders the display by calling display functions; address, map, today weather, and 5-day weather
const renderDisplay = ({ lat, lon, name }) => {
  showAddress(lat, lon, name);
  showMap(lat, lon, name);
  showTodaysWeather(lon, lat, name);
  showFiveDayForecast(lon, lat);
}

// reads from local storage cities array, or passes an emply array if nothing found
const readCitiesFromStorage = () => {
  let cities = localStorage.getItem('cities');
  if (cities) {
    cities = JSON.parse(cities);
  } else {
    cities = [];
  }
  return cities;
}

// saves an array named cities to the local storgae
const saveCitiesToStorage = (cities) => {
  localStorage.setItem('cities', JSON.stringify(cities));
}


// fetches  request to openstreetmap api using address search to get lng-lat coordinates
const handleAddressSearch = (event) => {
  event.preventDefault();
  let url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=3&q=" +
    address.value;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {

      let newCity = {
        name: data[0].name,
        lon: data[0].lon,
        lat: data[0].lat
      }

      // adds the city searched to the front of the cities array, keep the array length at 10 max
      let cities = readCitiesFromStorage();
      cities.unshift(newCity);
      cities = cities.slice(0, 10);
      saveCitiesToStorage(cities);
      return newCity;
    })
    .then((data) => {
      address.value = '';
      location.reload();
    })
    .catch((err) => console.log(err));
}

// initial init function to start the page by calling renderDisplay and renderButtons functions
const init = () => {
  let cities = readCitiesFromStorage();

  if (cities.length > 0) {
    renderDisplay(cities[0]);
    renderButtons(cities);
  }
  else {
    return;
  }
  return;
}

// renders the buttons based on the number of elements in the cities array
const renderButtons = (cities) => {
  for (let i = 0; i < cities.length; i++) {
    let buttonElement = `<button type="button" class="btn btn-primary city-btn" data-index="${i}">${cities[i].name}</button>`;
    $("#button-list").append(buttonElement);
  }
}

// button handler for the search btn
$('#search-btn').on("click", handleAddressSearch);

// button hander for button list, using event delegation to get the specific button that's clicked
$('#button-list').on('click', '.city-btn', function (event) {
  event.preventDefault();
  let cityIndex = parseInt($(this).attr('data-index'));
  console.log(cityIndex);
  let cities = readCitiesFromStorage();
  let chosenCity = cities[cityIndex];
  cities.splice(cityIndex, 1);
  cities.unshift(chosenCity);
  saveCitiesToStorage(cities);
  location.reload();
});

// function to run on script load
init();
