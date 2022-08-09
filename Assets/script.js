const APIKey = "77415a19f908a268653af581efb06f11";
const currentDate = $(".currentDate");
const searchedCity = $(".text-city")
const searchInput = $("#city-input");
const cityNameEl = $(".cityName");
const searchHistoryEl = $(".history");
const currentDateEl = $(".currentDate");
const weatherIconEl = $(".weather-icon");
const weatherDescriptionEl = $(".description");
const tempEl = $(".temp");
const humidityEl = $(".humidity");
const windSpeedEl = $(".windSpeed");
const uvIndexEl = $(".uv-Index");
const forcastCardEl = $(".forcast-cards");

let searchHistory = JSON.parse(localStorage.getItem("search")) || [];


$(".searchBtn").on("click", function (event) {
  event.preventDefault();
  if (searchInput.val() === "") {
    const erroMessageEl = $(".search-error-message");
    erroMessageEl.text("Please enter a city");
    return;
  } else {
    searchHistory.push(searchInput.val());
    window.location.reload();
    localStorage.setItem("search", JSON.stringify(searchHistory));
  };
  getWeather(searchInput.val());
});

function getDate(date) {
  let currentDate = new Date(date * 1000);
  console.log(currentDate);
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  return month + "/" + day + "/" + year;
}

function getWeather(cityName) {
  let queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
  fetch(queryUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {

      cityNameEl.text(response.name + " (" + getDate(response.dt) + ") ");
      let weatherIcon = response.weather[0].icon;
      weatherIconEl.attr("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png");
      weatherIconEl.attr("alt", response.weather[0].description);
      weatherDescriptionEl.text(response.weather[0].main + ", " + response.weather[0].description);
      tempEl.text("Temperature: " + k2F(response.main.temp) + " °F");
      humidityEl.text("Humidity: " + response.main.humidity + "%");
      windSpeedEl.text("Wind Speed: " + response.wind.speed + " MPH");

      let lat = response.coord.lat;
      let lon = response.coord.lon;

      let uvIndexQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + apiKey;
      console.log(uvIndexQueryUrl);
      fetch(uvIndexQueryUrl)
        .then(function (uvResponse) {
          return uvResponse.json();
        })
        .then(function (uvResponse) {
          var uvConditions;

          if (uvResponse.current.uvi < 3) {
            uvConditions = "uv-favorable";
          }
          else if (uvResponse.current.uvi >= 3 && uvResponse.current.uvi < 6) {
            uvConditions = "uv-moderate";
          } else {
            uvConditions = "uv-severe";
          }
          uvIndexEl.addClass(uvConditions).text("UV Index: " + uvResponse.current.uvi);

          let prevCardEl = $(".card-panel")
          for (i = 0; i < prevCardEl.length; i++) {
            $('.card-panel').remove();
          }

          console.log(uvResponse.daily);
          let dataArry = uvResponse.daily;

          for (let i = 0; i < 5; i++) {
            console.log(dataArry[i])
            let dataIcon = "https://openweathermap.org/img/wn/" + dataArry[i].weather[0].icon + "@2x.png";

            createForecast(getDate(dataArry[i].dt), dataIcon, k2F(dataArry[i].temp.day), dataArry[i].humidity, dataArry[i].wind_speed);
          }
        });
    });
}


function createForecast(date, icon, temp, humidity, windSpeed) {

  let fiveDayCardEl = $("<div>").addClass("card-panel col-sm-2 bg-primary text-white m-2 p-4 rounded");

  let cardDate = $("<h5>").addClass("card-title");

  let cardIcon = $("<img>").addClass("weatherIcon");

  let cardTemp = $("<p>").addClass("card-text");
  let cardHumidity = $("<p>").addClass("card-text");
  let cardWindSpeed = $("<p>").addClass("card-text");


  cardDate.text(date);
  cardIcon.attr("src", icon);

  cardTemp.text(`Temperature: ${temp}°F`);
  cardHumidity.text(`Humidity: ${humidity}%`);
  cardWindSpeed.text(`Wind Speed: ${windSpeed} MPH`);

  fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumidity, cardWindSpeed);

  forcastCardEl.append(fiveDayCardEl);
}


function renderSearchHistory() {

  if (searchHistory.length != 0) {

    for (let i = 0; i < searchHistory.length; i++) {

      let searchedCity = $("<div>");

      searchedCity.append("<a href='#' class='list-group-item'>" + searchHistory[i]);
      searchedCity.append("<a id='storedData'></a>");
      let storedData = $('#storedData');

      searchedCity.on("click", function () {

        storedData.val(searchHistory[i]);
        console.log(storedData.val());

        getWeather(searchHistory[i]);
      })
      searchHistoryEl.append(searchedCity);
    }
  }
}


$(document).ready(function () {
  renderSearchHistory();

  if (searchHistory.length > 0) {

    getWeather(searchHistory[searchHistory.length - 1]);
  }
});