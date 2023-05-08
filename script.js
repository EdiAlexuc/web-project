// api url: http://www.omdbapi.com/?s=thor&apikey=72eac67a

const movieSearchBox = document.getElementById('search-box');
const resultGrid = document.getElementById('result-grid'); 

async function getMovies(searchItem) {
  const URL = `http://www.omdbapi.com/?s=${searchItem}&apikey=72eac67a`;
  const response = await fetch(`${URL}`);
  const data = await response.json();
  // console.log(data);
  if(data.Response == "True") {
    displayMovieList(data.Search);
  }
}

function displayMovieList(movies) {
  resultGrid.innerHTML = "";
  movies.forEach(movie => {
    const movieDiv = document.createElement("div");
    movieDiv.classList.add("movie");
    const moviePoster = document.createElement("img");
    moviePoster.src = movie.Poster;
    const movieTitle = document.createElement("h3");
    movieTitle.innerText = movie.Title;
    const movieYear = document.createElement("p");
    movieYear.innerText = movie.Year;
    const movieType = document.createElement("p");
    movieType.innerText = movieType;
    movieDiv.appendChild(moviePoster);
    movieDiv.appendChild(movieTitle);
    movieDiv.appendChild(movieYear);
    movieDiv.appendChild(movieType);
    movieDiv.appendChild(movieDiv); 
  });
}

movieSearchBox.addEventListener("submit", (event) => {
  event.preventDefault();
  const searchItem = movieSearchBox.nextElementSibling.searchItem.value;
  getMovies(searchItem);
});

getMovies('inception');