var searchForm = $('#search-form');
var searchText = $('#form-text');
var searchHistory = $('#search-history');
var searchResult = $('#search-result');
var forecastCards = $('#forecast-cards');

var apiURL = 'https://api.openweathermap.org/data/2.5/onecall?';
var apiGeoURL = 'https://api.openweathermap.org/geo/1.0/direct?q=';
var apiImgURL = 'https://openweathermap.org/img/wn/'
var apiExcludeQuery = '&exclude=minutely,hourly';
var apiUnts = '&units=imperial'
var apiKey = '&appid=52582e6635792302e602f73ae0392fd7';
var today = moment().format('l');


searchForm.on('submit', handleSubmit);
function handleSubmit (event) {
    event.preventDefault();
    var searchInput = $('#search-input').val();
    if (!searchInput) {
        searchText.text('Need to enter city!');
        searchText.css('color', 'red');
        return;
    }
    searchCity(searchInput);
}


function searchCity(searchInput) {
   
    searchInput = searchInput.toLowerCase().trim();
    var geoURL = apiGeoURL + searchInput + '&limit=1' + apiKey;


    fetch(geoURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data[0]) {
                searchTextEl.text('Need to enter city name!');
                searchTextEl.css('color', 'red');
                return;
            }
            var lat = 'lat=' + data[0].lat;
            var lon = 'lon=' + data[0].lon;
            var cityQuery = lat + '&' + lon;
            renderSearchResults(cityQuery, capitalize(searchInput));
        })
}


function renderSearchResults(cityQuery, cityName) {

    removePreviousSearch();

 
    localStorage.setItem(cityName, cityQuery);

  
    var localQueryURL = apiURL + cityQuery + apiUnts + apiExcludeQuery + apiKey;
    
    fetch(localQueryURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
          
            renderSearchHistory();
            
          
            var todayWeatherList = ['Temp: ' + data.current.temp + ' °F', 'Wind Speed: '+ data.current.wind_speed + ' MPH', 'Humidity: ' + data.current.humidity + '%'];
            var weatherIconURL = apiImgURL + data.current.weather[0].icon + '.png';
            var weatherIconImg = '<img src="'+ weatherIconURL +'" alt="'+ data.current.weather[0].description +'">'
            searchResultEl.append('<h3 class="text-white fw-bolder mb-3">'+ cityName + ' (' + today + ') ' + weatherIconImg + '</h3>');
            for (let i = 0; i < todayWeatherList.length; i++) {
                searchResult.append('<p class="text-white ms-3">'+ todayWeatherList[i] +'</p>');
            }
            
            var uvColor = 'bg-success'; 
            var uvi = data.current.uvi;
            if (uvi >= 8) {
                uvColor = 'bg-danger';
            } else if (uvi >= 6) {
                uvColor = 'custom-bg-orange';
            } else if (uvi >= 3) {
                uvColor = 'bg-warning';
            }
            searchResult.append('<p class="text-white ms-3">UV Index: <span class="fw-bolder rounded ' + uvColor + ' text-white px-3 py-2">' + uvi + '</span> </p> ');
            

            for (let i = 1; i < 6; i++) {
                var currentDay = moment.unix(data.daily[i].dt).format('l');
                var currentIconURL = apiImgURL + data.daily[i].weather[0].icon + '@4x.png';
                forecastCards.append(
                    '<div class="col card p-2 m-2 text-white custom-gradient-card">' +
                      '<h4>' + currentDay + '</h4>' +
                      '<img src="'+ currentIconURL +'" alt="'+ data.daily[i].weather[0].description +'">' +
                      '<p> Temp: ' + data.daily[i].temp.day + ' °F </p>' +
                      '<p> Wind: ' + data.daily[i].wind_speed + ' MPH </p>' +
                      '<p> Humidity: ' + data.daily[i].humidity + '% </p>' +
                    '</div>'
                )
            }
        })
}


function removePreviousSearch() {
    searchResult[0].innerHTML = '';
    forecastCards[0].innerHTML = '';
}


searchHistory.on('click', '.btn', handleSearchHistory)
function handleSearchHistory(event) {
    var searchHistoryItm = event.target.innerHTML;
    renderSearchResults(localStorage.getItem(searchHistoryItm),searchHistoryItm);
}

// Displays the search history based on the contents of local storage
// Credit to https://stackoverflow.com/questions/3138564/looping-through-localstorage-in-html5-and-javascript
// for help on looping through local storage
function renderSearchHistory() {
    searchHistory[0].innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
        searchHistory.prepend(
            '<div class="d-grid">' +
                '<button type="button" class="btn btn-warning mb-2">'+  localStorage.key(i) + '</button>' +
            '</div>'
        );
    }
}

// Credit https://flexiple.com/javascript-capitalize-first-letter/ for implementation
// Capitalize first letter of each word in a string, through spaces as well
function capitalize(string) {
    const arr = string.split(" ");


    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    
    }
    

    const finalString = arr.join(" ");
    return finalString;
}

renderSearchHistory();