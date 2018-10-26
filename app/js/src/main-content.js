
/*
==================================================================
    MAIN CONTENT
==================================================================
*/

/*
==============================
    SHOW SEARCH RESULTS
==============================
*/

function showSearchResults(results) {
    for (let i = 0; i < 6; i++) {
        if (results[i].media_type == 'movie' || results[i].media_type == 'tv') {

            let title = results[i].title || results[i].name;
            let date = results[i].release_date || results[i].first_air_date || '';
            let mediaType = results[i].media_type || 'movie';

            if (date) {
                date = date.slice(0,4);
            };
            searchResults.innerHTML += `<p onclick="fetchMediaData('${mediaType}',${results[i].id});resetSearchResults()">${title} (${date})</p>`;
        };
    };
};



/*
==============================
    SHOW CONTENT RESULTS
==============================
*/

function showContentResults(results) {
    resetMediaResults();

    results.map((result, i) => {
        const tmdbId = result.id || '0';
        const title = result.title || result.name || 'Unknown';
        const rating = result.vote_average || '0';
        const poster = POSTER + result.poster_path || '';
        let mediaType;

        // Check if media type is movie or tvshow
        if (result.hasOwnProperty('adult')) mediaType = 'movie';
        else  mediaType = 'tv';

        // Check if media already already exists in a collection
        let inCollectionColor = '#222';
        if (isInCollection(tmdbId)) {
            inCollectionColor = 'crimson';
        };

        mainContent.innerHTML += `
            <div class="media-item">
                <i class="material-icons is-in-collection" style="color: ${inCollectionColor}">collections</i>
                <img src="${poster}" alt="${title}" onclick="fetchMediaData('${mediaType}',${tmdbId})">
                <span class="more-information" onclick="fetchMediaData('${mediaType}',${tmdbId})">More Information</span>
                <div>
                    <span class="title">${title}</span><span class="rating">${rating}</span>
                </div>
                <div>
                    <p class="add-remove-from-collection" onclick="addRemoveFromCollection(${tmdbId})">Add/Remove from Collection</p>
                </div>
            </div>
        `;
    });

    onMediaHover();
};



/*
==============================
    PAGINATION 
==============================
*/

function showFullMediaContent( mediaType, result) {

    const title = result.title || result.name || 'Unknown';
    const tagline = result.tagline || `SEASONS: ${result.number_of_episodes} EPISODES:${result.number_of_episodes}` || '';
    const overview = result.overview || '';
    const rating = result.vote_average || '0';
    const poster = POSTER + result.poster_path || '';

    fullMediaContent.innerHTML = `
        <p>MEDIA DETAILS <i class="material-icons close-media-content" onclick="resetFullMediaContent()">close</i></p>
        <div id="media-showcase" style="background-image: url('${BACKDROP}${result.backdrop_path}')">
            <h1 id="media-title">${title}</h1>
        </div>

        <div id="media-details">
            <img src="${poster}" alt="${title}">
        </div>
        
        <div id="media-extra">
            <p id="media-tagline">${tagline}</p>
            <p id="media-overview">${overview}</p>
        </div>
    `;
    fullMediaContent.style.display = 'block';
}


/*
==============================
    PAGINATION 
==============================
*/

function pagination(primary, secondary, page) {
    resetPagination();
    let i = 0;

    // Give previous page option unless its the 1st page
    if (page > 1) {
        mainPagination.innerHTML += `<span class="pagination-box" onclick="fetchTMDbData('${primary}','${secondary}',${page - 1})">${page - 1}</span>`;
    };

    while (i < 5) {
        // Highlight Active Page
        if (i == 0) {
            mainPagination.innerHTML += `<span class="pagination-box" style="background-color: #333;" onclick="fetchTMDbData('${primary}','${secondary}',${page + i})">${page + i}</span>`;
        }
        else {
            mainPagination.innerHTML += `<span class="pagination-box" onclick="fetchTMDbData('${primary}','${secondary}',${page + i})">${page + i}</span>`;
        };
        i++;
    };
};



/*
==============================
    HOVER MEDIA POSTER
==============================
*/

function onMediaHover() {
    const mediaItem = document.querySelectorAll('.media-item');
    mediaItem.forEach(item => {
        item.onmouseenter = () => {
            item.children[2].style.display = 'inline-block';
        };

        item.onmouseleave = () => {
            item.children[2].style.display = 'none';
        };
    });
};
