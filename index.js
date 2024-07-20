// 設常數以利後續維護
const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = [] //存放搜尋後的結果

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")

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
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
            </div>`
  )
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) //無條件進位
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  //movies? "movies" : "filterMovies"
  const data = filteredMovies.length ? filteredMovies : movies //如果filteredMovies長度大於0，代表filteredMovies有內容，則使用filteredMovies資料，否則使用movies資料

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) //開始索引, 結束索引（不包含），回傳新陣列
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

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [] //取在local storage裡的資料放進清單，或無資料，JSON.parse()轉物件或陣列
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) { //避免重複收藏
    return alert("此電影已經在收藏清單中！")
  }

  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list)) //把更新後的收藏清單同步到local storage，只能存字串
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id)) //dataset會取得點擊目標所有data-開頭的屬性
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }

})

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return //如果點擊不是<a></a>標籤，結束函式
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})



searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //停止瀏覽器預設行為
  const keyword = searchInput.value.trim().toLowerCase() //取值，去頭去尾，轉成小寫以利後續比較

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword)) //filter: 陣列用法

  if (filteredMovies.length === 0) {
    return alert("Cannot find movies with keyword: " + keyword)
  }

  renderPaginator(filteredMovies.length) //根據filteredMovies的長度來決定
  renderMovieList(getMoviesByPage(1)) //預設顯示第1頁
})

axios.get(INDEX_URL)
  .then(response => {
    // for (const movie of response.data.results) {
    //   movies.push(movie) 
    // }
    movies.push(...response.data.results) // ...: 展開陣列元素
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  }
  )
  .catch(error => console.log(error))

