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
}

getMovies('inception');