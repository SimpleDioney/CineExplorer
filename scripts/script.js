const API_KEY = '4ea270f32fe4e8fcdfd68b4cd5a7074f';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
    let currentLanguage = 'en-US';
    let currentMovieId = null;
    let genres = [];
    let selectedGenres = [];

    const translations = {
      'en-US': {
        searchPlaceholder: "Discover new movies...",
        surpriseMe: "Surprise Me",
        loading: "Loading...",
        mainCast: "Main Cast",
        similarMovies: "Similar Movies",
        trailer: "Trailer",
        birthdate: "Born:",
        deathdate: "Died:",
        knownFor: "Known For:",
        filmography: "Filmography",
        whereToWatch: "Where to Watch",
        mostViewedMovies: "Most Viewed Movies in",
        boxOfficeHits: "Box Office Hits",
        topRatedMovies: "Top Rated Movies",
        allGenres: "All Genres"
      },
      'pt-BR': {
        searchPlaceholder: "Descubra novos filmes...",
        surpriseMe: "Surpreenda-me",
        loading: "Carregando...",
        mainCast: "Elenco Principal",
        similarMovies: "Filmes Similares",
        trailer: "Trailer",
        birthdate: "Nascimento:",
        deathdate: "Falecimento:",
        knownFor: "Conhecido por:",
        filmography: "Filmografia",
        whereToWatch: "Onde Assistir",
        mostViewedMovies: "Filmes mais vistos em",
        boxOfficeHits: "Sucessos de bilheteria",
        topRatedMovies: "Melhores avaliados",
        allGenres: "Todos os Gêneros"
      },
      'es-ES': {
        searchPlaceholder: "Descubre nuevas películas...",
        surpriseMe: "Sorpréndeme",
        loading: "Cargando...",
        mainCast: "Reparto Principal",
        similarMovies: "Películas Similares",
        trailer: "Tráiler",
        birthdate: "Nacimiento:",
        deathdate: "Fallecimiento:",
        knownFor: "Conocido por:",
        filmography: "Filmografía",
        whereToWatch: "Dónde Ver",
        mostViewedMovies: "Películas más vistas en",
        boxOfficeHits: "Éxitos de taquilla",
        topRatedMovies: "Mejor valoradas",
        allGenres: "Todos los Géneros"
      }
    };

    
    function updateLanguage() {
      document.getElementById('search-input').placeholder = translations[currentLanguage].searchPlaceholder;
      document.getElementById('surprise-me').textContent = translations[currentLanguage].surpriseMe;
      document.querySelector('#most-viewed .section-title').textContent = `${translations[currentLanguage].mostViewedMovies} ${new Date().getFullYear()}`;
      document.querySelector('#box-office-hits .section-title').textContent = translations[currentLanguage].boxOfficeHits;
      document.querySelector('#top-rated .section-title').textContent = translations[currentLanguage].topRatedMovies;
      
      if (document.getElementById('movie-details').style.display !== 'none') {
        document.querySelector('#movie-details .section-title:nth-of-type(1)').textContent = translations[currentLanguage].trailer;
        document.querySelector('#movie-details .section-title:nth-of-type(2)').textContent = translations[currentLanguage].mainCast;
        document.querySelector('#movie-details .section-title:nth-of-type(3)').textContent = translations[currentLanguage].whereToWatch;
        document.querySelector('#movie-details .section-title:nth-of-type(4)').textContent = translations[currentLanguage].similarMovies;
      }

      updateGenreFilter();
    }

    async function fetchGenres() {
      try {
        const response = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${currentLanguage}`);
        genres = response.data.genres;
        updateGenreFilter();
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    }

    function updateGenreFilter() {
      const genreFilter = document.getElementById('genre-filter');
      genreFilter.innerHTML = '';

      const allGenresButton = document.createElement('button');
      allGenresButton.textContent = translations[currentLanguage].allGenres;
      allGenresButton.classList.add('active');
      allGenresButton.addEventListener('click', () => {
        selectedGenres = [];
        updateGenreButtonStates();
        fetchMovieLists();
      });
      genreFilter.appendChild(allGenresButton);

      genres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre.name;
        button.addEventListener('click', () => {
          const index = selectedGenres.indexOf(genre.id);
          if (index > -1) {
            selectedGenres.splice(index, 1);
          } else {
            selectedGenres.push(genre.id);
          }
          updateGenreButtonStates();
          fetchMovieLists();
        });
        genreFilter.appendChild(button);
      });
    }

    function updateGenreButtonStates() {
      const buttons = document.querySelectorAll('#genre-filter button');
      buttons.forEach(button => {
        if (button.textContent === translations[currentLanguage].allGenres) {
          button.classList.toggle('active', selectedGenres.length === 0);
        } else {
          const genre = genres.find(g => g.name === button.textContent);
          if (genre) {
            button.classList.toggle('active', selectedGenres.includes(genre.id));
          }
        }
      });
    }

    async function fetchMovieLists() {
      const currentYear = new Date().getFullYear();
      const genreParam = selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(',')}` : '';
      const lists = [
        { id: 'most-viewed', url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${currentLanguage}&sort_by=popularity.desc&primary_release_year=${currentYear}${genreParam}` },
        { id: 'box-office-hits', url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${currentLanguage}&sort_by=revenue.desc${genreParam}` },
        { id: 'top-rated', url: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${currentLanguage}&sort_by=vote_average.desc&vote_count.gte=1000${genreParam}` }
      ];

      for (const list of lists) {
        try {
          const response = await axios.get(list.url);
          updateMovieList(list.id, response.data.results.slice(0, 10));
        } catch (error) {
          console.error(`Error fetching ${list.id} movies:`, error);
        }
      }
    }

    function updateMovieList(listId, movies) {
  const movieList = document.querySelector(`#${listId} .movie-list`);
  movieList.innerHTML = '';
  movies.forEach(movie => {
    const movieItem = document.createElement('div');
    movieItem.className = 'movie-item';
    movieItem.innerHTML = `
      <img class="movie-poster" src="${IMG_BASE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
      <p class="movie-item-title">${movie.title}</p>
    `;
    movieItem.addEventListener('click', () => fetchMovieData(movie.id));
    movieList.appendChild(movieItem);
  });

  // Add faster horizontal scroll functionality
  addHorizontalScroll(movieList);
}

    async function fetchMovieData(movieId = null) {
      try {
        if (!movieId) {
          const randomPage = Math.floor(Math.random() * 500) + 1;
          const genreParam = selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(',')}` : '';
          const randomMovieResponse = await axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${currentLanguage}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}${genreParam}`);
          const randomIndex = Math.floor(Math.random() * randomMovieResponse.data.results.length);
          movieId = randomMovieResponse.data.results[randomIndex].id;
        }

        currentMovieId = movieId;
        const movieResponse = await axios.get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${currentLanguage}&append_to_response=videos,credits,similar,watch/providers`);
        const movie = movieResponse.data;

        updateUI(movie);
        showMovieDetails();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    function showMovieDetails() {
      document.getElementById('main-content').style.display = 'none';
      document.getElementById('movie-details').style.display = 'block';
    }

    function showMainContent() {
      document.getElementById('main-content').style.display = 'block';
      document.getElementById('movie-details').style.display = 'none';
    }

    function updateUI(movie) {
      document.getElementById('movie-title').textContent = movie.title;
      
      // Convertendo minutos para horas e minutos
      const hours = Math.floor(movie.runtime / 60);
      const minutes = movie.runtime % 60;
      const durationString = `${hours} h e ${minutes} min`;
      
      document.getElementById('movie-meta').textContent = `${formatDate(movie.release_date)} | ${durationString} | ★ ${movie.vote_average.toFixed(1)}`;
      document.getElementById('movie-overview').textContent = movie.overview;
      document.getElementById('movie-header').style.backgroundImage = `url(${IMG_BASE_URL}${movie.backdrop_path || movie.poster_path})`;
    
      updateGenreTags(movie.genres);
      updateStarRating(movie.vote_average);
      updateTrailer(movie.videos.results);
      updateCast(movie.credits.cast);
      updateProviders(movie['watch/providers'].results);
      updateSimilarMovies(movie.similar.results);
    }

    function updateGenreTags(genres) {
      const genreTagsContainer = document.getElementById('genre-tags');
      genreTagsContainer.innerHTML = '';
      genres.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = 'genre-tag';
        genreTag.textContent = genre.name;
        genreTagsContainer.appendChild(genreTag);
      });
    }

    function updateStarRating(rating) {
      const starRating = document.getElementById('star-rating');
      const ratingValue = document.getElementById('rating-value');
      starRating.innerHTML = '';
      const fullStars = Math.floor(rating / 2);
      const halfStar = rating % 2 >= 1;

      for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        if (i < fullStars) {
          star.innerHTML = '<i class="fas fa-star"></i>';
        } else if (i === fullStars && halfStar) {
          star.innerHTML = '<i class="fas fa-star-half-alt"></i>';
        } else {
          star.innerHTML = '<i class="far fa-star"></i>';
        }
        starRating.appendChild(star);
      }

      ratingValue.textContent = `${rating.toFixed(1)}/10`;
    }

    function updateTrailer(videos) {
      const trailerContainer = document.getElementById('trailer-container');
      trailerContainer.innerHTML = '';
      const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      if (trailer) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
        iframe.allowFullscreen = true;
        trailerContainer.appendChild(iframe);
      } else {
        trailerContainer.textContent = 'No trailer available';
      }
    }

    function addHorizontalScroll(element) {
  element.addEventListener('wheel', (event) => {
    if (event.deltaY !== 0) {
      event.preventDefault();
      // Increase the scroll speed by multiplying the deltaY
      element.scrollLeft += event.deltaY * 3;
    }
  });
}

function updateCast(cast) {
  const castList = document.getElementById('cast-list');
  castList.innerHTML = '';
  cast.slice(0, 5).forEach(actor => {
    const castItem = document.createElement('div');
    castItem.className = 'cast-item';
    castItem.innerHTML = `
      <img class="cast-photo" src="${IMG_BASE_URL}${actor.profile_path}" alt="${actor.name}" loading="lazy">
      <p class="cast-name">${actor.name}</p>
    `;
    castItem.addEventListener('click', () => openActorPopup(actor.id));
    castList.appendChild(castItem);
  });

  // Add faster horizontal scroll functionality
  addHorizontalScroll(castList);
}
    function updateProviders(providers) {
      const providersContainer = document.getElementById('providers-container');
      providersContainer.innerHTML = '';

      const country = currentLanguage.split('-')[1];
      const countryProviders = providers[country];

      if (countryProviders && (countryProviders.flatrate || countryProviders.rent || countryProviders.buy)) {
        const providerList = document.createElement('div');
        providerList.className = 'provider-list';

        const allProviders = [
          ...(countryProviders.flatrate || []),
          ...(countryProviders.rent || []),
          ...(countryProviders.buy || [])
        ];

        const uniqueProviders = allProviders.filter((provider, index, self) =>
          index === self.findIndex((t) => t.provider_id === provider.provider_id)
        );

        uniqueProviders.forEach(provider => {
          const providerItem = document.createElement('div');
          providerItem.className = 'provider-item';
          providerItem.innerHTML = `
            <img class="provider-logo" src="${IMG_BASE_URL}${provider.logo_path}" alt="${provider.provider_name}" loading="lazy">
            <span class="provider-name">${provider.provider_name}</span>
          `;
          providerList.appendChild(providerItem);
        });

        providersContainer.appendChild(providerList);
      } else {
        providersContainer.textContent = 'No streaming information available for your region.';
      }
    }

    function updateSimilarMovies(similarMovies) {
      const similarMoviesContainer = document.getElementById('similar-movies');
      similarMoviesContainer.innerHTML = '';
      similarMovies.slice(0, 6).forEach(similar => {
        const similarMovie = document.createElement('div');
        similarMovie.className = 'similar-movie';
        similarMovie.innerHTML = `
          <img src="${IMG_BASE_URL}${similar.poster_path}" alt="${similar.title}" loading="lazy">
          <div class="similar-movie-info">
            <h3 class="similar-movie-title">${similar.title}</h3>
            <p class="similar-movie-year">${similar.release_date.split('-')[0]}</p>
          </div>
        `;
        similarMovie.addEventListener('click', () => fetchMovieData(similar.id));
        similarMoviesContainer.appendChild(similarMovie);
      });
    }

    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(currentLanguage, options);
    }

    function openActorPopup(actorId) {
      document.body.classList.add('popup-open');
      showPopup(actorId);
    }

    function closeActorPopup() {
      document.body.classList.remove('popup-open');
      document.getElementById('popup-overlay').style.display = 'none';
    }

    async function showPopup(actorId) {
      const popupOverlay = document.getElementById('popup-overlay');
      const popupTitle = document.getElementById('popup-title');
      const popupImage = document.getElementById('popup-image');
      const popupInfo = document.getElementById('popup-info');
      const popupBio = document.getElementById('popup-bio');
      const popupFilmography = document.getElementById('popup-filmography');

      popupTitle.textContent = translations[currentLanguage].loading;
      popupImage.src = '';
      popupInfo.innerHTML = '';
      popupBio.textContent = '';
      popupFilmography.innerHTML = '';
      popupOverlay.style.display = 'flex';

      try {
        const response = await axios.get(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=${currentLanguage}&append_to_response=combined_credits`);
        const actorInfo = response.data;

        popupTitle.textContent = actorInfo.name;
        popupImage.src = `${IMG_BASE_URL}${actorInfo.profile_path}`;
        popupImage.alt = actorInfo.name;

        let infoHtml = '';
        if (actorInfo.birthday) {
          infoHtml += `<p>${translations[currentLanguage].birthdate} ${formatDate(actorInfo.birthday)}</p>`;
        }
        if (actorInfo.deathday) {
          infoHtml += `<p>${translations[currentLanguage].deathdate} ${formatDate(actorInfo.deathday)}</p>`;
        }
        infoHtml += `<p>${translations[currentLanguage].knownFor} ${actorInfo.known_for_department}</p>`;
        popupInfo.innerHTML = infoHtml;

        popupBio.textContent = actorInfo.biography;

        const filmographyHtml = `
          <h3>${translations[currentLanguage].filmography}</h3>
          <ul>
            ${actorInfo.combined_credits.cast.slice(0, 10).map(movie => `
              <li data-movie-id="${movie.id}">${movie.title || movie.name} (${(movie.release_date || movie.first_air_date || '').split('-')[0]})</li>
            `).join('')}
          </ul>
        `;
        popupFilmography.innerHTML = filmographyHtml;

        // Add click event listeners to filmography items
        popupFilmography.querySelectorAll('li').forEach(item => {
          item.addEventListener('click', (event) => {
            const movieId = event.target.getAttribute('data-movie-id');
            fetchMovieData(movieId);
            closeActorPopup();
          });
        });

      } catch (error) {
        popupTitle.textContent = 'Error';
        popupBio.textContent = 'Error loading actor information. Please try again later.';
        console.error('Error fetching actor information:', error);
      }
    }

    document.querySelector('.popup-close').addEventListener('click', closeActorPopup);

    document.getElementById('language-select').addEventListener('change', (event) => {
      currentLanguage = event.target.value;
      updateLanguage();
      fetchGenres();
      if (document.getElementById('movie-details').style.display !== 'none') {
        if (currentMovieId) {
          fetchMovieData(currentMovieId);
        } else {
          fetchMovieData();
        }
      } else {
        fetchMovieLists();
      }
    });

    document.getElementById('search-input').addEventListener('keypress', async (event) => {
      if (event.key === 'Enter') {
        const query = event.target.value;
        const searchResponse = await axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=${currentLanguage}&query=${query}`);
        if (searchResponse.data.results.length > 0) {
          fetchMovieData(searchResponse.data.results[0].id);
        }
      }
    });

    document.getElementById('surprise-me').addEventListener('click', () => {
      fetchMovieData();
    });

    document.querySelector('.logo').addEventListener('click', () => {
      showMainContent();
      fetchMovieLists();
    });

    updateLanguage();
    fetchGenres();
    fetchMovieLists();