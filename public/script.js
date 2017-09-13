$(document).ready(function () {

  var indoor = [['spa', 'spa'], ['shopping', 'department_store'], ['restaurant', 'fine dining'], ['museum', 'museum'], ['bowling', 'bowling lane'], ['movies', 'movies']]
  var outdoor = [['museum', 'museum'], ['park', 'park'], ['restaurant', 'fine dining'], ['biking', 'biking'], ['golf', 'golf course'], ['zoo', 'zoo']]
  var map
  var service
  var secondKey = $('.hidden-key').text()

  // set up city search to autocomplete
  var input = document.getElementById('citySearch')
  var citySearch = new google.maps.places.Autocomplete(input, {types: ['(cities)']})

  //listen for form to change
  google.maps.event.addListener(citySearch, 'place_changed', function(){
    //complete form with cities only
    city = citySearch.getPlace()
    //get latitude and longitude for location
    lat = city.geometry.location.lat()
    lng = city.geometry.location.lng()
      //connect to weather api with lat and lng
      $.ajax({
        url: `http://api.apixu.com/v1/forecast.json?key=${secondKey}&q=${lat},${lng}`,
        type: 'get',
        dataType: 'json'
        }).done((response) => {
            console.log('weather request success!')
            //if weather request is successful, run displayWeather function
            displayWeather(response)
            //when user clicks on category name, run function to get places
            $('.category').on('click', getPlaces)
        }).fail(() => {
            console.log('new weather request failed')
        }).always(() => {
            console.log('log regardless of ajax success or fail')
        })
    })


  function displayWeather (response) {
    currentTemp = Math.round(response.current.temp_f)
    feelslikeTemp = Math.round(response.current.feelslike_f)
    currentDescription = response.current.condition.text
    dailyDescription = response.forecast.forecastday[0].day.condition.text
    $('<p class="temp"></p>').prependTo('.weather').text(`${currentTemp}°`)
    $('<p></p>').appendTo('.weatherDetails').text(`Feels like ${feelslikeTemp}°`)
    $('<p></p>').appendTo('.weatherDetails').text(`Current: ${currentDescription}`)
    $('<p></p>').appendTo('.weatherDetails').text(`Today's forecast: ${dailyDescription}`)
    //recommend activities based on weather
    mapWeatherToActivities()
    scrollWeather()
  }

  function scrollWeather (){
    $('html, body').animate({
        scrollTop: $('#weatherResults').offset().top
    }, 1500);
    return false;
  }


  function mapWeatherToActivities () {
    //if rain, cold, or too hot do indoor, else do outdoor
    if (currentDescription.toLowerCase().indexOf('rain') !== -1 || dailyDescription.toLowerCase().indexOf('rain') !== -1
    || currentDescription.toLowerCase().indexOf('mist') !== -1 || dailyDescription.toLowerCase().indexOf('mist') !== -1
    || currentDescription.toLowerCase().indexOf('drizzle') !== -1 || dailyDescription.toLowerCase().indexOf('drizzle') !== -1
    || feelslikeTemp < 60 || feelslikeTemp > 100) {
      randomizeActivities(indoor)
      console.log('indoor')
      randomizeList.forEach(function(activity) {
        $('<div></div>').appendTo('.categories').text(`${activity[0]}`).attr({'class': 'category', 'id': `${activity[1]}`})
      })
    }  else {
      console.log('outdoot')
      randomizeActivities(outdoor)
      randomizeList.forEach(function(activity) {
        $('<div></div>').appendTo('.categories').text(`${activity[0]}`).attr({'class': 'category', 'id': `${activity[1]}`})
      })
    }
  };

  function randomizeActivities (activityList) {
   randomizeList = activityList.sort(function(a, b){return 0.5 - Math.random()}).slice(0,4)
   return randomizeList
 }

// find places from google places
  function getPlaces() {
    //set type to search as category selected by user
    var categoryType = $(this).attr('id')
    //search by locations lat lng values
    var location = new google.maps.LatLng(lat,lng)
    // must create map though it wont be displayed in this app
    map = new google.maps.Map(document.getElementById('map'), {})
    // assign properties to request
    var request = {
      location: location,
      radius: '5000', //meters
      keyword: categoryType, //can be type or keyword
      exclude: ['liquor_store', 'alcohol', 'hotel', 'health', 'apartment', 'hotel', 'Jiu Jitsu', 'karate'],
      rankBy: google.maps.places.RankBy.PROMINENCE //can also rank by distance
    }
    // perform nearby search with requested props
    service = new google.maps.places.PlacesService(map)
    service.nearbySearch(request, callback)
  }
  // function based on results
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        var place = results[i]
        // perform details search by place id based on results, call displayPlaces function
          service.getDetails({placeId: place.place_id}, displayPlaces)
      }
    }
  }
  // display place search result details on page
  function displayPlaces (place, status) {
    if (place !==  'undefined' && place) {
      console.log(place)
    $(`<p>${place.name}</p>`).appendTo('#placeResults')
    $(`<p>${place.formatted_address}</p>`).appendTo('#placeResults')
    // edit site to link whole section or add logic to show if there
    $(`<p>website: <a href="${place.website}">${place.website}</a></p>`).appendTo('#placeResults')
    // add logic to round rating and show star image possibly
    $(`<p>${place.rating} stars</p>`).appendTo('#placeResults')
      if (place.reviews !== 'undefined' && place.reviews[0].text.length > 0) {
        {$(`<p>review: ${place.reviews[0].text}</p>`).appendTo('#placeResults')}
      }

    }
    scrollPlace()
  }

  function scrollPlace (){
    $('html, body').stop().animate({
        scrollTop: $('#placeResults').offset().top
    }, 1500);
    return false;
  }

})
