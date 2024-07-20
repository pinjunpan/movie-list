// 設常數以利後續維護
const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || [] //更改取得資料的來源

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item =>
    rawHTML += `<div class="col-sm-2">
                <div class="mb-2">
                    <div class="card">
                        <img src="${POSTER_URL + item.image}"
                            class="card-img-top" alt="Movie poster">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
                        </div>
                    </div>
                </div>
            </div>`
  )
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
}

function removeFromFavorite(id) {
  if (!movies || !movies.length) return //傳入的id在收藏清單中不存在，或收藏清單是空的，就結束這個函式
  const movieIndex = movies.findIndex((movie) => movie.id === id) //找到索引位置
  if (movieIndex === -1) return //找不到會回傳-1

  movies.splice(movieIndex, 1)

  localStorage.setItem("favoriteMovies", JSON.stringify(movies)) //更新local storage
  renderMovieList(movies) //即時更新畫面
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id)) //dataset會取得點擊目標所有data-開頭的屬性
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }

})

renderMovieList(movies) 