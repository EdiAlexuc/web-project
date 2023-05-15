const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
let searchCounter = 0; // Counter for tracking number of searches

// Load movies from API
async function loadMovies(searchTerm) {
  let cachedMovies = getCachedMovies(searchTerm);
  if(cachedMovies) {
    displayMovieList(cachedMovies);
  } else {
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=fc1fef96`;
    const res = await fetch(URL);
    const data = await res.json();
    if (data.Response == "True") {
      cacheMovies(searchTerm, data.Search);
      displayMovieList(data.Search);
    }
  }
}

// Search movies in the JSON
function findMovies() {
  let searchTerm = movieSearchBox.value.trim();
  if (searchTerm.length > 0) {
    searchList.classList.remove('hide-search-list');
    loadMovies(searchTerm);
    searchCounter++; // Increment search counter
    if(searchCounter > 20) {
      clearCache(); // Call method to clear cache after 10 searches
      searchCounter = 0;
    }
  } else {
    searchList.classList.add('hide-search-list');
  }
}

function cacheMovies(searchTerm, movies) {
  localStorage.setItem(searchTerm, JSON.stringify(movies));
}

function getCachedMovies(searchTerm) {
  const cachedMovies = localStorage.getItem(searchTerm);
  if(cachedMovies) {
    return JSON.parse(cachedMovies);
  }
  
  return null;
}

function displayMovieList(movies) {
  searchList.innerHTML = "";
  for (let idx = 0; idx < movies.length; idx++) {
    let movieListItem = document.createElement('div');
    movieListItem.dataset.id = movies[idx].imdbID;
    movieListItem.classList.add('search-list-item');
    let moviePoster = movies[idx].Poster != "N/A" ? movies[idx].Poster : "image_not_found.png";

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

function loadMovieDetails() {
  const searchListMovies = searchList.querySelectorAll('.search-list-item');
  searchListMovies.forEach(movie => {
    movie.addEventListener('click', async () => {
      searchList.classList.add('hide-search-list');
      movieSearchBox.value = "";
      const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=fc1fef96`);
      const movieDetails = await result.json();
      displayMovieDetails(movieDetails);
    });
  });
}

async function loadMovieTrailer(title, year) {
  const apiKey = 'AIzaSyB9cC9bexnuE2O2FFJt_q3n9aUDFa_oxrg';
  const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    title + ' ' + year + ' official trailer'
  )}&key=${apiKey}`;

  const response = await fetch(searchURL);
  const data = await response.json();

  if (data.items.length > 0) {
    const trailerId = data.items[0].id.videoId;
    displayMovieTrailer(trailerId);
  } else {
    displayNoTrailerMessage();
  }
}

function displayMovieDetails(details) {
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

function isMovieRecommended(title, imdbRating, metascore){
    let message;
    if((imdbRating!="N/A") || (metascore!="N/A")){
      if((imdbRating >= 8.0) || (metascore >= 80)) {
        message = `${title} is a very good movie. You should watch it!`;
      } else if((imdbRating<5) || (metascore < 50)) {
        message = `${title} is not a movie you should generally consider.`;
      } else {
        message = `${title} is a decent movie. You could try watching it!`;
    }
  } else message = `${title} doesn't have an imdb rating or metascore so we can't recommend it or not recommend it.`
    document.getElementById("recommendation-message").innerHTML = message;
  }

function displayMovieTrailer(trailerId) {
  const trailerContainer = document.getElementById('trailer-container');
  trailerContainer.innerHTML = `
    <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailerId}" frameborder="0" allowfullscreen></iframe>
  `;
}


function displayNoTrailerMessage() {
const trailerContainer = document.getElementById('trailer-container');
trailerContainer.innerHTML = '<p>No trailer available.</p>';
}

window.addEventListener('click', (event) => {
if (event.target.className != "form-control") {
searchList.classList.add('hide-search-list');
}
});

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
