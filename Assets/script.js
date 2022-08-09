const APIKey = "77415a19f908a268653af581efb06f11";
$("#currentDate").text("Today " + moment().format('ddd Do'));

for (let i = 0; i < 5; i++) {
  var startForecast = i + 1;
  var forecastCard = $(`div[data-card|="${i}"]`);
  forecastCard.html(`<h4> ${moment().add(startForecast, 'days').format('ddd')} </h4>`);
};

var searchedCity;

$(document).ready(function () {

  $('#search-city').submit(function () {
    event.preventDefault();
    searchedCity = $('#city-text').val().trim();
    currentWeather(searchedCity);
    getUVIndex(searchedCity);
    getForecast(searchedCity);
    addHistory(searchedCity);
  })
});

var cityList = [];

if (localStorage.getItem('Cities') === null) {

  cityList = ["Atlanta", "Buenos Aires", "Seoul", "London", "San Francisco", "Beijing"];

  localStorage.setItem('Cities', JSON.stringify(cityList));

  cityList.forEach(element => {
    $('#searchHistory').append(`
            <li class="searchItem">${element}</li>
        `);
  });

  currentWeather(cityList[0]);
  getUVIndex(cityList[0]);
  getForecast(cityList[0]);

} else {

  cityList = JSON.parse(localStorage.getItem('Cities'));

  cityList.forEach(element => {

    $('#searchHistory').append(`
            <li class="searchItem">${element}</li>
        `);
  });

  currentWeather(cityList[0]);
  getUVIndex(cityList[0]);
  getForecast(cityList[0]);

}

$('.searchItem').on('click', function (event) {

  var itemText = event.target.innerText;

  $('#tex-city').val(itemText);

  currentWeather(itemText);
  getUVIndex(itemText);
  getForecast(itemText);

});

function addHistory() {

  $('#searchHistory').prepend(`
        <li class="searchItem">${searchedCity}</li>
    `);

  cityList.unshift(searchedCity);

  localStorage.setItem('Cities', JSON.stringify(cityList));

};

function getForecast(cityToSearch) {

  var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?appid=" + APIKey + "&q=" + cityToSearch + "&units=imperial";

  $.ajax({
    url: forecastURL,
    method: "GET"
  }).then(function (response) {

    var forecastStart = 6;

    for (let i = 0; i < 5; i++) {

      var forecastCard = $(`div[data-card|="${i}"]`);

      var forecastDay = moment(response.list[forecastStart].dt_txt).format('ddd');

      var forecastTemp = Math.round(response.list[forecastStart].main.temp);

      var forecastHumid = response.list[forecastStart].main.humidity;

      var forecastIcon = response.list[forecastStart].weather[0].icon;

      var iconURL = "https://openweathermap.org/img/wn/" + forecastIcon + ".png";

      var forecastDescription = response.list[forecastStart].weather[0].description;

      forecastCard.html(`
                <h4>${forecastDay}</h4>
                <p class="forecastNumber">${forecastTemp} <span class="units">&#176;F</span></p>
                <p class="weatherDescription">${forecastDescription}</p>
                <img src="${iconURL}">
                <p class="forecastHumid">${forecastHumid} <span class="units">%</span></p>
            `);

      forecastStart += 8;

    }
  });
};

function currentWeather(cityToSearch) {

  var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=" + APIKey + "&q=" + cityToSearch + "&units=imperial";


  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {

    $(".city").html(response.name);

    $("#currentDate").text(moment(response.dt).format('ddd Do'));

    var temp = Math.round(response.main.temp);
    $(".temp").html(`${temp}`);
    $(".temp").append(`<span class="units">&#176;F</span>`);

    $(".humidity").html(`${response.main.humidity} `);
    $(".humidity").append(`<span class="units">%</span>`);

    var wind = Math.round(response.wind.speed);
    $(".wind").html(`${wind}`);
    $(".wind").append(`<span class="units">mph</span>`);

    var currentIcon = response.weather[0].icon;

    var iconURL = "https://openweathermap.org/img/wn/" + currentIcon + ".png";

    $('#currentIcon').attr("src", iconURL);

    $('#currentDescription').text(response.weather[0].description);

  });
};


function getUVIndex(cityToSearch) {

  var queryURL = "https://api.openweathermap.org/data/2.5/weather?appid=" + APIKey + "&q=" + cityToSearch;

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {

    var cityLong = response.coord.lon;
    var cityLat = response.coord.lat;

    var UVqueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + cityLat + "&lon=" + cityLong;

    $.ajax({
      url: UVqueryURL,
      method: "GET"
    }).then(function (response) {

      $('.UV').html(`${response.value}`);

      if (response.value <= 2) {
        $('.UV').css('background-color', '#8DC443');
        $('.UV').css('color', 'white');
      } else if (response.value > 2 && response.value <= 5) {
        $('.UV').css('background-color', '#FDD835');
        $('.UV').css('color', 'white');
      } else if (response.value > 5 && response.value <= 7) {
        $('.UV').css('background-color', '#FFB301');
        $('.UV').css('color', 'white');
      } else if (response.value > 7 && response.value <= 10) {
        $('.UV').css('background-color', '#D1394A');
        $('.UV').css('color', 'white');
      } else if (response.value > 10) {
        $('.UV').css('background-color', '#954F71');
        $('.UV').css('color', 'white');
      }
    });
  });
};