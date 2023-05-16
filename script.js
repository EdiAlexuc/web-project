// Get  the movie search box, search list, result grid elements and searchCounter for clearing the cache
const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
let searchCounter = 0; // Counter for tracking number of searches

// Load movies from API
async function loadMovies(searchTerm) {
  let cachedMovies = getCachedMovies(searchTerm);
  // If there are cached movies for the search term, it will display them
  if(cachedMovies) {
    displayMovieList(cachedMovies);
  // Else, it uses the URL to fetch movie data from the OMDB API
  } else {
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=72eac67a`;
    const res = await fetch(URL);
    const data = await res.json();
    // If data was found regarding the search, it will cache it and display the data found.
    if (data.Response == "True") {
      cacheMovies(searchTerm, data.Search);
      displayMovieList(data.Search);
    }
  }
}

// Search movies in the JSON
function findMovies() {
  let searchTerm = movieSearchBox.value.trim();
  /* If if the user typed something to search (the serch term length is greater than 0)
  it will make the list of movies to appear */
  if (searchTerm.length > 0) {
    searchList.classList.remove('hide-search-list');
    loadMovies(searchTerm);
    searchCounter++; // Increment search counter
    if(searchCounter > 20) {
      clearCache(); // Call method to clear cache after 10 searches
      searchCounter = 0;
    }
  // Else, the list will remain hidden until the user types something
  } else {
    searchList.classList.add('hide-search-list');
    resultGrid.innerHTML = '';
    document.getElementById('trailer-container').innerHTML='';
  }
}

// Cache movies in local storage
function cacheMovies(searchTerm, movies) {
  localStorage.setItem(searchTerm, JSON.stringify(movies));
}

// Get cached movies from local storage
function getCachedMovies(searchTerm) {
  const cachedMovies = localStorage.getItem(searchTerm);
  if(cachedMovies) {
    return JSON.parse(cachedMovies);
  }
  
  return null;
}

// Display the movie list in the search list element
function displayMovieList(movies) {
  searchList.innerHTML = "";
  /* For each movie, using it's index, it will create an element
  and will asign to it the imdb ID of the movie and adds the css to it*/
  for (let idx = 0; idx < movies.length; idx++) {
    let movieListItem = document.createElement('div');
    movieListItem.dataset.id = movies[idx].imdbID;
    movieListItem.classList.add('search-list-item');
    // If the current movie has no poster, it will assign a default image to it
    let moviePoster = movies[idx].Poster != "N/A" ? movies[idx].Poster : "image_not_found.png";
    /* Creates the html code for each movie in the list and then adds 
    the item to the list */
    movieListItem.innerHTML = `
      <div class="search-item-thumbnail">
        <img src="${moviePoster}">
      </div>
      <div class="search-item-info">
        <h3>${movies[idx].Title}</h3>
        <p>${movies[idx].Year}</p>
      </div>
    `;
    searchList.appendChild(movieListItem);
  }
  loadMovieDetails();
}

// Load movie details when a movie is clicked
function loadMovieDetails() {
  const searchListMovies = searchList.querySelectorAll('.search-list-item');
  // It iterates each movie and adds the click event listener
  searchListMovies.forEach(movie => {
    movie.addEventListener('click', async () => {
      // If the user clicks on a movie, the search list will become hidden again
      searchList.classList.add('hide-search-list');
      movieSearchBox.value = "";
      // Using the imdb ID stored in movie.dataset.id, it will fetch the movie's data
      const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=72eac67a`);
      const movieDetails = await result.json();
      displayMovieDetails(movieDetails);
    });
  });
}

// Load movie trailer from Youtube
async function loadMovieTrailer(title, year) {
  const apiKey = 'AIzaSyB9cC9bexnuE2O2FFJt_q3n9aUDFa_oxrg';
  const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title + ' ' + year + ' official trailer')}&key=${apiKey}`;
  const response = await fetch(searchURL);
  const data = await response.json();

  if (data.items.length > 0) {
    const trailerId = data.items[0].id.videoId;
    displayMovieTrailer(trailerId);
  } else {
    displayNoTrailerMessage();
  }
}

// Display the movie details in the result-grid element
function displayMovieDetails(details) {
  // Creates the html code for the result grid
  resultGrid.innerHTML = `
    <div class="movie-poster">
      <img src="${details.Poster != 'N/A' ? details.Poster : 'image_not_found.png'}" alt="movie poster">
    </div>
    <div class="movie-info">
      <h3 class="movie-title">${details.Title}</h3>
      <ul class="movie-misc-info">
        <li class="year">Year: ${details.Year}</li>
        <li class="ratings">Ratings: IMDB ${details.imdbRating}, Metascore ${details.Metascore}</li>
        <li class="released">Released: ${details.Released}</li>
      </ul>
      <p class="agerestrictions">Age restrictions: ${details.Rated}</p>
      <p class="genre"><b>Genre:</b> ${details.Genre}</p>
      <p class="writer"><b>Writer:</b> ${details.Writer}</p>
      <p class="actors"><b>Actors: </b>${details.Actors}</p>
      <p class="plot"><b>Plot:</b> ${details.Plot}</p>
      <p class="language"><b>Language:</b> ${details.Language}</p>
      <p class="awards"><b><i class="fas fa-award"></i></b> ${details.Awards}</p>
      <p id="recommendation-message"></p>
    </div>
  `;
    isMovieRecommended(details.Title, details.imdbRating, details.Metascore);
    loadMovieTrailer(details.Title, details.Year);
}

// Check if a movie is recommended based on ratings
function isMovieRecommended(title, imdbRating, metascore){
    let message;
    // If the movie has at least one of the two ratings it goes on
    if((imdbRating!="N/A") || (metascore!="N/A")){
      /*It checks in what group of rating score the movie is positioned and assigns the 
      right custom message to it */
      if((imdbRating >= 8.0) || (metascore >= 80)) {
        message = `${title} is a very good movie. Check out the trailer ↓ !`;
      } else if((imdbRating<5) || (metascore < 50)) {
        message = `${title} is not a movie you should generally consider. If you are intrested, check out the trailer Check out the trailer ↓ !`;
      } else {
        message = `${title} is a decent movie. Check out the trailer ↓ !`;
    }
    // Else, if the movie has no rating, it will show this message
    } else message = `${title} doesn't have an imdb rating or metascore so we can't recommend it or not recommend it, but maybe you can check out the trailer ↓`
    document.getElementById("recommendation-message").innerHTML = message;
  }

  // Display the movie trailer
function displayMovieTrailer(trailerId) {
  const trailerContainer = document.getElementById('trailer-container');
  trailerContainer.innerHTML = `
    <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailerId}" frameborder="0" allowfullscreen></iframe>
  `;
}

// Display a message when no trailer is available
function displayNoTrailerMessage() {
const trailerContainer = document.getElementById('trailer-container');
trailerContainer.innerHTML = '<p>No trailer available.</p>';
}

// Close the search list when clicking outside the search
window.addEventListener('click', (event) => {
if (event.target.className != "form-control") {
searchList.classList.add('hide-search-list');
}
});

// Clear cache
function clearCache() {
  localStorage.clear();
}

// Function to check if an element is in the viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to handle the scroll event
function handleScroll() {
  const trailerContainer = document.getElementById('trailer-container');
  if (isInViewport(trailerContainer)) {
    trailerContainer.classList.add('show');
  }
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll);
