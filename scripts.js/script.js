const API_KEY = '4ea270f32fe4e8fcdfd68b4cd5a7074f';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
    let currentLanguage = 'en-US';

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
        whereToWatch: "Where to Watch"
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
        whereToWatch: "Onde Assistir"
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
        whereToWatch: "Dónde Ver"
      }
    };

    function updateLanguage() {
      document.getElementById('search-input').placeholder = translations[currentLanguage].searchPlaceholder;
      document.getElementById('surprise-me').textContent = translations[currentLanguage].surpriseMe;
      document.querySelector('.section-title:nth-of-type(1)').textContent = translations[currentLanguage].trailer;
      document.querySelector('.section-title:nth-of-type(2)').textContent = translations[currentLanguage].mainCast;
      document.querySelector('.section-title:nth-of-type(3)').textContent = translations[currentLanguage].whereToWatch;
      document.querySelector('.section-title:nth-of-type(4)').textContent = translations[currentLanguage].similarMovies;
    }

    async function fetchMovieData(movieId = null) {
      try {
        if (!movieId) {
          const randomPage = Math.floor(Math.random() * 500) + 1;
          const randomMovieResponse = await axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${currentLanguage}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}`);
          const randomIndex = Math.floor(Math.random() * randomMovieResponse.data.results.length);
          movieId = randomMovieResponse.data.results[randomIndex].id;
        }

        const movieResponse = await axios.get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=${currentLanguage}&append_to_response=videos,credits,similar,watch/providers`);
        const movie = movieResponse.data;

        updateUI(movie);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    function updateUI(movie) {
      document.getElementById('movie-title').textContent = movie.title;
      document.getElementById('movie-meta').textContent = `${formatDate(movie.release_date)} | ${movie.runtime} min | ★ ${movie.vote_average.toFixed(1)}`;
      document.getElementById('movie-overview').textContent = movie.overview;
      document.getElementById('movie-header').style.backgroundImage = `url(${IMG_BASE_URL}${movie.backdrop_path || movie.poster_path})`;

      // Update genre tags
      const genreTagsContainer = document.getElementById('genre-tags');
      genreTagsContainer.innerHTML = '';
      movie.genres.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = 'genre-tag';
        genreTag.textContent = genre.name;
        genreTagsContainer.appendChild(genreTag);
      });

      // Update star rating
      updateStarRating(movie.vote_average);

      // Update trailer
      updateTrailer(movie.videos.results);

      // Update cast
      updateCast(movie.credits.cast);

      // Update providers
      updateProviders(movie['watch/providers'].results);

      // Update similar movies
      updateSimilarMovies(movie.similar.results);
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
          star.textContent = '★';
        } else if (i === fullStars && halfStar) {
          star.textContent = '½';
        } else {
          star.textContent = '☆';
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

    function updateCast(cast) {
      const castList = document.getElementById('cast-list');
      castList.innerHTML = '';
      cast.slice(0, 5).forEach(actor => {
        const castItem = document.createElement('div');
        castItem.className = 'cast-item';
        castItem.innerHTML = `
          <img class="cast-photo" src="${IMG_BASE_URL}${actor.profile_path}" alt="${actor.name}">
          <p class="cast-name">${actor.name}</p>
        `;
        castItem.addEventListener('click', () => openActorPopup(actor.id));
        castList.appendChild(castItem);
      });
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
            <img class="provider-logo" src="${IMG_BASE_URL}${provider.logo_path}" alt="${provider.provider_name}">
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
          <img src="${IMG_BASE_URL}${similar.poster_path}" alt="${similar.title}">
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

    async function openActorPopup(actorId) {
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
            popupOverlay.style.display = 'none';
          });
        });

      } catch (error) {
        popupTitle.textContent = 'Error';
        popupBio.textContent = 'Error loading actor information. Please try again later.';
        console.error('Error fetching actor information:', error);
      }
    }

    document.querySelector('.popup-close').addEventListener('click', () => {
      document.getElementById('popup-overlay').style.display = 'none';
    });

    document.getElementById('language-select').addEventListener('change', (event) => {
      currentLanguage = event.target.value;
      updateLanguage();
      fetchMovieData();
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

    updateLanguage();
    fetchMovieData();
