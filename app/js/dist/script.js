
/*
==================================================================
    GLOBAL VARIABLES
==================================================================
*/

const menuBtn = document.querySelector('#menu-btn');
const searchInput = document.querySelector('#search-input');
const searchClear = document.querySelector('.search-clear');
const searchResults = document.querySelector('#search-results');
const primaryNav = document.querySelector('#primary-nav');
const secondaryNav = document.querySelector('#secondry-nav');
const navItem = document.querySelectorAll('.nav-item');
const main = document.querySelector('#main');
const mainContent = document.querySelector('#main-content');
const mainPagination = document.querySelector('#main-pagination');
const fullMediaContent = document.querySelector('#full-media-content');
const myLists = document.querySelector('#main-mylists');
const userLists = document.querySelector('#user-lists');


let state = {
    movies : ['Popular', 'Top Rated', 'Upcoming', 'Now Playing'],
    tvshows : ['Popular', 'Top Rated', 'On the Air', 'Airing Today'],
    mylists : {}
};



/*
==================================================================
    GLOBAL EVENT LISTENERS
==================================================================
*/

function setEventListeners() {

    /*
    ==============================
        MENU BTN CLICK
    ==============================
    */

    menuBtn.addEventListener('click', () => { 
        if (menuBtn.innerHTML == 'menu') {
            menuBtn.innerHTML = 'close';
            primaryNav.style.left = '0';
        } 
        else {
            menuBtn.innerHTML = 'menu';
            primaryNav.style.left = '-140px';
            
        }
        resetSearchResults();
    });



    /*
    ==============================
    NAV ITEM CLICK
    ==============================
    */

    navItem.forEach(navitem => {
        navitem.addEventListener('click', () => {
            nav(navitem.dataset.nav);
            
            if (window.innerWidth < 800) {
                menuBtn.click();
                }
                resetSearchResults();
            });
    });

    

    /*
    ==============================
        SEARCH INPUT / CLEAR
    ==============================
    */

    searchInput.addEventListener('input', () => {
        getSearchInput();
    });
 
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.visibility =  'hidden';
        resetSearchResults();
    });
    


    /*
    ==============================
        WINDOW RESIZE
    ==============================
    */

    window.addEventListener("resize", () => {
        if (window.innerWidth > 800 && primaryNav.style.left == '-140px') {
            menuBtn.innerHTML = 'menu';
            primaryNav.style.left = '0';
            
        }
        else if (window.innerWidth < 800) {
            primaryNav.style.left = '-140px';
        }
        resetSearchResults();
    });
};



/*
==================================================================
    GLOBAL RESETS
==================================================================
*/

function clickOutsideElement() {
    let clickOutsideElement = main.addEventListener('click', () => {
       resetSearchResults();
       mainContent.removeEventListener('click', clickOutsideElement);
   });
};

function resetSearchResults() {
   searchResults.innerHTML = '';
};

function resetMediaResults() {
   mainContent.innerHTML = '';
};

function resetPagination() {
   mainPagination.innerHTML = '';
};

function resetFullMediaContent() {
   fullMediaContent.style.display = 'none';
};

function resetMyLists() {
   myLists.style.display = 'none';
};





/*
==================================================================
    NAVIGATION FUNCTIONS
==================================================================
*/

/*
==============================
    MANAGE ACTIVE CLASS
==============================
*/

// Iterate over nav items and remove active class
function manageActiveClass(primary, secondary) {
    let activeParent = document.querySelectorAll('.nav-parent');
    let activeChild = document.querySelectorAll('.nav-child');

    activeParent.forEach(parent => {
        parent.classList.remove('active-parent');
        if (parent.dataset.nav.includes(primary)) {
            parent.classList.add('active-parent');
        };
    });

    activeChild.forEach(child => {
        child.classList.remove('active-child');
        if (child.dataset.nav.includes(secondary)) {
            child.classList.add('active-child');
        };
    });

};



/*
==============================
    MANAGE SECONDARY NAV
==============================
*/

function manageSecondaryNav(primary, secondary) {
    if (secondary == 'null') {
        secondaryNav.innerHTML = ``;
        return;
    };

    secondaryNav.innerHTML = `<ul>`
    for (let i of state[primary]) {
        let secondary = i.toLowerCase().replace(/\s/g, '_');
        secondaryNav.innerHTML += `
            <li tabindex="0" class="nav-child nav-item" onclick="nav('${primary},${secondary}')" data-nav="${primary},${secondary}">${i}</li>
        `;
    };
    secondaryNav.innerHTML += `</ul>`;
};



/*
==============================
    MAIN NAIGATION FUNCTION
==============================
*/

function nav(param) {
    let nav = param.split(',');
    let primary = nav[0];
    let secondary = nav[1];

    switch(primary) {
        case 'movies':
            fetchTMDbData(primary, secondary);
            break;
        case 'tvshows':
            fetchTMDbData(primary, secondary);
            break;
        case 'mylists':
            showMyLists();
            break;
        case 'statistics':
            break;
        default:
            break;
    };

    resetMediaResults();
    resetPagination(); 
    resetFullMediaContent();
    manageSecondaryNav(primary, secondary);
    manageActiveClass(primary, secondary);
};



/*
==============================
    SEARCH INPUT FUNCTION
==============================
*/

function getSearchInput() {
    if (searchInput.value.length > 3) {
        searchClear.style.visibility =  'visible';
        clickOutsideElement();
        getTMDbSearchData(searchInput.value.replace(/\s/g, '%20'));
    };

    if (searchInput.value.length < 4) resetSearchResults();
};








/*
==================================================================
    LOCAL STORAGE FUNCTIONS
==================================================================
*/

/*
==============================
    CHECK/GET USER LISTS
==============================
*/

function parseLocalStorageLists() {
    if ('movielist:userlists' in localStorage) {
        let userlists = localStorage.getItem('movielist:userlists');
        userlists = JSON.parse(userlists);
        let keys = Object.keys(userlists);

        for (let list in userlists) {
            state.mylists[list] = userlists[list];
        };
    };
};

function checkIfInCollection(tmdbId) {

    let arr= [[],[]];
    if (Object.keys(state.mylists).length !== 0) {

        // Iterate over lists
        for(let lists in state.mylists) {
            let list = state.mylists[lists];
            arr[0].push(lists);

            for (let i = 0; i < list.length; i++) {
                if (tmdbId == list[i].id) {
                    arr[1].push(true, lists);
                    break;
                };
            } ;
        };
    };
    return arr;
};



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

            if (date)  date = date.slice(0,4);
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
    resetMyLists();

    results.map(result => {
        const tmdbId = result.id;
        const title = result.title || result.name || 'Unknown';
        const rating = result.vote_average || '0';
        let poster = POSTER + result.poster_path;
        let mediaType;
        
        if (result.poster_path == null) poster = DEFAULT_POSTER;
        if (result.hasOwnProperty('adult')) mediaType = 'movie';
        else  mediaType = 'tv';


        // CHECK IF IN COLLECTION
        let inCollectionColor = '#222';
        let collections = checkIfInCollection(tmdbId);
        if (collections[1][0]) inCollectionColor = 'crimson';


        mainContent.innerHTML += `
            <div class="media-item">
                <i class="material-icons is-in-collection" style="color: ${inCollectionColor}">collections</i>
                <img class="media-poster" src="${poster}" alt="${title}" onclick="fetchMediaData('${mediaType}',${tmdbId})">
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
    SHOW FULL MEDIA CONTENT 
==============================
*/

function showFullMediaContent(mediaType, result) {

    const tmdbId = result.id || '0';
    const title = result.title || result.name || 'Unknown';
    const tagline = result.tagline || `NO. SEASONS: ${result.number_of_seasons}  ~  NO. EPISODES: ${result.number_of_episodes}` || '';
    const overview = result.overview || '';
    const rating = result.vote_average || '0';
    let date = result.release_date || result.first_air_date || '';
    let status = result.status || '';
    let backdrop = BACKDROP + result.backdrop_path;
    let poster = POSTER + result.poster_path;
    let trailer = []; 

    if (date) date = date.split('-').reverse().join('-');
    if (result.backdrop_path == null) backdrop = DEFAULT_BACKDROP;
    if (result.poster_path == null) poster = DEFAULT_POSTER;

    // Get Trailer and check for undefined
    if (result.videos.results.length != 0) {
        trailer = result.videos.results.map(video => {
            if (video.type == 'Trailer') {
                return `https://www.youtube.com/watch?v=${video.key}`;
            }
        }).filter(video => {
            if (video != 'undefined') {
                return video;
            }
        });
    } 
    // If no trailer exists - search youtube
    else {
        trailer[0] = `https://www.youtube.com/results?search_query=${title}`;
    }


    fullMediaContent.innerHTML = `
        <p class="content-title">MEDIA DETAILS <i class="material-icons close-media-content" onclick="resetFullMediaContent()">close</i></p>
        <div id="media-showcase" style="background-image: url('${backdrop}')">
            <a class="download-fanart" href="${backdrop}"target="_blank">DOWNLOAD FANART<br /><i class="material-icons download-icon">cloud_download</i></a>
            <h1 id="media-title">${title}</h1>
        </div>
        <div id="media-details">
            <img width="140" id="media-poster" src="${poster}" alt="${title}">
            <div id="media-details-bar">
                <a href="${trailer[0]}" target=_blank">Trailer</a>
                <span>${rating}</span>
                <span>${status}</span>
                <span>${date}</span>
                <span class="from-collection" onclick="addRemoveFromCollection(${tmdbId})">Add/Remove from Collection</span>
            </div>
            <p id="media-tagline">${tagline}</p>
            <p id="media-overview">${overview}</p>
        </div>
    `;
    fullMediaContent.style.display = 'block';
};



/*
==============================
    GET & Show USER LISTS
==============================
*/

function showMyLists() {
    myLists.style.display = 'block';

    if (Object.keys(state.mylists).length !== 0) {
         // Iterate over lists
         for(let lists in state.mylists) {
            let list = state.mylists[lists];

            let userList = `
            <div class="userlist">
                <div class="list-titlebar">
                    <h2>${lists}</h2>
                    <p class="delete-list">Delete List<i class="material-icons delete-list-icon">delete</i></p>
                </div>
            `;

            for (let i = 0; i < list.length; i++) {
                const tmdbId = list[i].id;
                const title = list[i].title || list[i].name || 'Unknown';
                const rating = list[i].vote_average || '0';

                let date = list[i].release_date || list[i].first_air_date || '';
                if (date)  date = date.slice(0,4);

                let mediaType;
                if (list[i].hasOwnProperty('adult')) mediaType = 'movie';
                else  mediaType = 'tv'; 

                userList += `
                    <p class="list-item">
                        <span class="list-item-title" onclick="fetchMediaData('${mediaType}',${tmdbId})">${title}  (${date})</span>
                        <span class="rating">${rating}</span>
                        <i class="material-icons delete-list-icon">delete</i>
                    </p>
                `;
            } ;
            userList += `</div>`;
            userLists.innerHTML += userList; 
        };

    }
    else {
        userLists.innerHTML = `<p class="list-heading">You don't have any created lists</p>`;
        let userlists = localStorage.setItem('movielist:userlists', sampleData);
    }
};



/*
==============================
    PAGINATION 
==============================
*/

function pagination(primary, secondary, page) {
    resetPagination();
    let i = 0;

    // Give previous page option unless its the 1st page
    if (page > 1) mainPagination.innerHTML += `<span class="pagination-box" onclick="fetchTMDbData('${primary}','${secondary}',${page - 1})">${page - 1}</span>`;

    while (i < 5) {
        // Highlight Active Page
        if (i == 0) mainPagination.innerHTML += `<span class="pagination-box" style="background-color: #333;" onclick="fetchTMDbData('${primary}','${secondary}',${page + i})">${page + i}</span>`;
        else mainPagination.innerHTML += `<span class="pagination-box" onclick="fetchTMDbData('${primary}','${secondary}',${page + i})">${page + i}</span>`;
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
        item.onmouseenter = () => item.children[2].style.display = 'inline-block';
        item.onmouseleave = () => item.children[2].style.display = 'none';
    });
};


/*
==================================================================
    TMDB API ROUTES
==================================================================
*/

/*
==============================
    VARIABLES
==============================
*/

const API_KEY = `?api_key=d41fd9978486321b466e29bfec203902`;
const MOVIES_URL = 'https://api.themoviedb.org/3/movie/';
const TVSHOWS_URL = 'https://api.themoviedb.org/3/tv/';
const SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';
const EXTRA = "&language=en-US";
const POSTER = 'https://image.tmdb.org/t/p/w200';
const BACKDROP = 'https://image.tmdb.org/t/p/w1280/';
const DEFAULT_BACKDROP = 'https://www.themoviedb.org/assets/1/v4/logos/408x161-powered-by-rectangle-blue-10d3d41d2a0af9ebcb85f7fb62ffb6671c15ae8ea9bc82a2c6941f223143409e.png'
const DEFAULT_POSTER = 'https://www.themoviedb.org/assets/1/v4/logos/408x161-powered-by-rectangle-blue-10d3d41d2a0af9ebcb85f7fb62ffb6671c15ae8ea9bc82a2c6941f223143409e.png'
let url;
let data;



/*
==============================
    FETCH TMDB DATA
==============================
*/

function fetchTMDbData(primary, secondary, page = 1) {
    if (primary == 'movies') url = MOVIES_URL;
    else if (primary == 'tvshows') url = TVSHOWS_URL;

    fetch(`${url}${secondary}${API_KEY}${EXTRA}&page=${+page}`, 
        {
            headers: new Headers ({ 'Accept': 'application/json'})
        })
    .then(response => {
        return response.text();
    })
    .then(text => {
        data = JSON.parse(text);
        showContentResults(data.results);
        pagination(primary, secondary, page)
    })
    .catch(err => {
        // TODO: 404 Error
        console.log(err);
    });
};



/*
==============================
    FETCH SEARCH DATA
==============================
*/

function getTMDbSearchData(searchQuery) {
    fetch(`${SEARCH_URL}${API_KEY}&language=en-US&query=${searchQuery}&page=1&include_adult=false`, 
        {
            headers: new Headers ({ 'Accept': 'application/json'})
        })
    .then(response => {
        return response.text();
    })
    .then(text => {
        data = JSON.parse(text);
        resetSearchResults();
        showSearchResults(data.results);
    })
    .catch(err => {
         // TODO: 404 Error
        console.log(err);
    });
};



/*
================================
    FETCH FULL MEDIA DATA
================================
*/

function fetchMediaData(mediaType,tmdbId) {
    
    if (mediaType == 'movie') url = MOVIES_URL;
    else url = TVSHOWS_URL;

    fetch(`${url}${tmdbId}${API_KEY}${EXTRA}&append_to_response=videos,images,reviews`, 
    {
        headers: new Headers ({ 'Accept': 'application/json'})
    })
    .then(response => {
        return response.text();
    })
    .then(text => {
        data = JSON.parse(text);
        showFullMediaContent(mediaType, data);
    })
    .catch(err => {
        // TODO: 404 Error
        console.log(err);
    });
};



/*
==================================================================
    SAMPLE DATA FOR DEVELOPMENT PURPOSES
==================================================================
*/

const mylists = {
    movies: [
      {
        "vote_count": 1497,
        "id": 335983,
        "video": false,
        "vote_average": 6.6,
        "title": "Venom",
        "popularity": 401.758,
        "poster_path": "/2uNW4WbgBXL25BAbXGLnLqX71Sw.jpg",
        "original_language": "en",
        "original_title": "Venom",
        "genre_ids": [
          878,
          28,
          80,
          28,
          27
        ],
        "backdrop_path": "/VuukZLgaCrho2Ar8Scl9HtV3yD.jpg",
        "adult": false,
        "overview": "When Eddie Brock acquires the powers of a symbiote, he will have to release his alter-ego \"Venom\" to save his life.",
        "release_date": "2018-10-03"
      },
      {
        "vote_count": 922,
        "id": 332562,
        "video": false,
        "vote_average": 7.5,
        "title": "A Star Is Born",
        "popularity": 196.325,
        "poster_path": "/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg",
        "original_language": "en",
        "original_title": "A Star Is Born",
        "genre_ids": [
          18,
          10402,
          10749
        ],
        "backdrop_path": "/840rbblaLc4SVxm8gF3DNdJ0YAE.jpg",
        "adult": false,
        "overview": "Seasoned musician Jackson Maine discovers—and falls in love with—struggling artist Ally. She has just about given up on her dream to make it big as a singer—until Jack coaxes her into the spotlight. But even as Ally's career takes off, the personal side of their relationship is breaking down, as Jack fights an ongoing battle with his own internal demons.",
        "release_date": "2018-10-03"
      },
      {
        "vote_count": 42,
        "id": 507569,
        "video": false,
        "vote_average": 5.8,
        "title": "The Seven Deadly Sins: Prisoners of the Sky",
        "popularity": 169.734,
        "poster_path": "/r6pPUVUKU5eIpYj4oEzidk5ZibB.jpg",
        "original_language": "ja",
        "original_title": "劇場版 七つの大罪 天空の囚われ人",
        "genre_ids": [
          28,
          12,
          14,
          16
        ],
        "backdrop_path": "/uKwOX7MtKlAaGeCQe6c4jc1vZpj.jpg",
        "adult": false,
        "overview": "Traveling in search of the rare ingredient, “sky fish”  Meliodas and Hawk arrive at a palace that floats above the clouds. The people there are busy preparing a ceremony, meant to protect their home from a ferocious beast that awakens once every 3,000 years. But before the ritual is complete, the Six Knights of Black—a Demon Clan army—removes the seal on the beast, threatening the lives of everyone in the Sky Palace.",
        "release_date": "2018-08-18"
      },
      {
        "vote_count": 639,
        "id": 346910,
        "video": false,
        "vote_average": 5.3,
        "title": "The Predator",
        "popularity": 167.001,
        "poster_path": "/wMq9kQXTeQCHUZOG4fAe5cAxyUA.jpg",
        "original_language": "en",
        "original_title": "The Predator",
        "genre_ids": [
          27,
          878,
          28,
          53
        ],
        "backdrop_path": "/f4E0ocYeToEuXvczZv6QArrMDJ.jpg",
        "adult": false,
        "overview": "From the outer reaches of space to the small-town streets of suburbia, the hunt comes home. Now, the universe’s most lethal hunters are stronger, smarter and deadlier than ever before, having genetically upgraded themselves with DNA from other species. When a young boy accidentally triggers their return to Earth, only a ragtag crew of ex-soldiers and a disgruntled science teacher can prevent the end of the human race.",
        "release_date": "2018-09-13"
      },
      {
        "vote_count": 8889,
        "id": 299536,
        "video": false,
        "vote_average": 8.3,
        "title": "Avengers: Infinity War",
        "popularity": 145.885,
        "poster_path": "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
        "original_language": "en",
        "original_title": "Avengers: Infinity War",
        "genre_ids": [
          12,
          878,
          28,
          14
        ],
        "backdrop_path": "/lmZFxXgJE3vgrciwuDib0N8CfQo.jpg",
        "adult": false,
        "overview": "As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.",
        "release_date": "2018-04-25"
      },
      {
        "vote_count": 147,
        "id": 424139,
        "video": false,
        "vote_average": 6.6,
        "title": "Halloween",
        "popularity": 131.422,
        "poster_path": "/lNkDYKmrVem1J0aAfCnQlJOCKnT.jpg",
        "original_language": "en",
        "original_title": "Halloween",
        "genre_ids": [
          27
        ],
        "backdrop_path": "/hO1oTBGNxO5fBKVEuWnSpICJH7c.jpg",
        "adult": false,
        "overview": "Laurie Strode comes to her final confrontation with Michael Myers, the masked figure who has haunted her since she narrowly escaped his killing spree on Halloween night four decades ago.",
        "release_date": "2018-10-18"
      },
      {
        "vote_count": 2912,
        "id": 363088,
        "video": false,
        "vote_average": 7,
        "title": "Ant-Man and the Wasp",
        "popularity": 124.999,
        "poster_path": "/rv1AWImgx386ULjcf62VYaW8zSt.jpg",
        "original_language": "en",
        "original_title": "Ant-Man and the Wasp",
        "genre_ids": [
          28,
          12,
          878,
          10749,
          35,
          10751
        ],
        "backdrop_path": "/6P3c80EOm7BodndGBUAJHHsHKrp.jpg",
        "adult": false,
        "overview": "Just when his time under house arrest is about to end, Scott Lang puts again his freedom at risk to help Hope van Dyne and Dr. Hank Pym dive into the quantum realm and try to accomplish, against time and any chance of success, a very dangerous rescue mission.",
        "release_date": "2018-07-04"
      },
      {
        "vote_count": 268,
        "id": 369972,
        "video": false,
        "vote_average": 7.3,
        "title": "First Man",
        "popularity": 123.269,
        "poster_path": "/i91mfvFcPPlaegcbOyjGgiWfZzh.jpg",
        "original_language": "en",
        "original_title": "First Man",
        "genre_ids": [
          36,
          18
        ],
        "backdrop_path": "/z1FkoHO7bz40S4JiptWHSYoPpxq.jpg",
        "adult": false,
        "overview": "A look at the life of the astronaut, Neil Armstrong, and the legendary space mission that led him to become the first man to walk on the Moon on July 20, 1969.",
        "release_date": "2018-10-11"
      },
      {
        "vote_count": 1177,
        "id": 439079,
        "video": false,
        "vote_average": 5.8,
        "title": "The Nun",
        "popularity": 108.868,
        "poster_path": "/sFC1ElvoKGdHJIWRpNB3xWJ9lJA.jpg",
        "original_language": "en",
        "original_title": "The Nun",
        "genre_ids": [
          27,
          9648,
          53
        ],
        "backdrop_path": "/fgsHxz21B27hOOqQBiw9L6yWcM7.jpg",
        "adult": false,
        "overview": "When a young nun at a cloistered abbey in Romania takes her own life, a priest with a haunted past and a novitiate on the threshold of her final vows are sent by the Vatican to investigate. Together they uncover the order’s unholy secret. Risking not only their lives but their faith and their very souls, they confront a malevolent force in the form of the same demonic nun that first terrorized audiences in “The Conjuring 2,” as the abbey becomes a horrific battleground between the living and the damned.",
        "release_date": "2018-09-05"
      },
      {
        "vote_count": 266,
        "id": 454992,
        "video": false,
        "vote_average": 6.5,
        "title": "The Spy Who Dumped Me",
        "popularity": 104.198,
        "poster_path": "/2lIr27lBdxCpzYDl6WUHzzD6l6H.jpg",
        "original_language": "en",
        "original_title": "The Spy Who Dumped Me",
        "genre_ids": [
          28,
          35,
          12
        ],
        "backdrop_path": "/uN6v3Hz4qI2CIqT1Ro4vPgAbub3.jpg",
        "adult": false,
        "overview": "Audrey and Morgan are best friends who unwittingly become entangled in an international conspiracy when one of the women discovers the boyfriend who dumped her was actually a spy.",
        "release_date": "2018-08-02"
      }
    ],
    tvshows: [
      {
        "original_name": "The Flash",
        "genre_ids": [
          18,
          10765
        ],
        "name": "The Flash",
        "popularity": 186.911,
        "origin_country": [
          "US"
        ],
        "vote_count": 2304,
        "first_air_date": "2014-10-07",
        "backdrop_path": "/mmxxEpTqVdwBlu5Pii7tbedBkPC.jpg",
        "original_language": "en",
        "id": 60735,
        "vote_average": 6.7,
        "overview": "After a particle accelerator causes a freak storm, CSI Investigator Barry Allen is struck by lightning and falls into a coma. Months later he awakens with the power of super speed, granting him the ability to move through Central City like an unseen guardian angel. Though initially excited by his newfound powers, Barry is shocked to discover he is not the only \"meta-human\" who was created in the wake of the accelerator explosion -- and not everyone is using their new powers for good. Barry partners with S.T.A.R. Labs and dedicates his life to protect the innocent. For now, only a few close friends and associates know that Barry is literally the fastest man alive, but it won't be long before the world learns what Barry Allen has become...The Flash.",
        "poster_path": "/fki3kBlwJzFp8QohL43g9ReV455.jpg"
      },
      {
        "original_name": "The Walking Dead",
        "genre_ids": [
          18,
          10759,
          10765
        ],
        "name": "The Walking Dead",
        "popularity": 111.067,
        "origin_country": [
          "US"
        ],
        "vote_count": 3725,
        "first_air_date": "2010-10-31",
        "backdrop_path": "/xVzvD5BPAU4HpleFSo8QOdHkndo.jpg",
        "original_language": "en",
        "id": 1402,
        "vote_average": 7.3,
        "overview": "Sheriff's deputy Rick Grimes awakens from a coma to find a post-apocalyptic world dominated by flesh-eating zombies. He sets out to find his family and encounters many other survivors along the way.",
        "poster_path": "/yn7psGTZsHumHOkLUmYpyrIcA2G.jpg"
      },
      {
        "original_name": "Marvel's Iron Fist",
        "genre_ids": [
          80,
          18,
          10759,
          10765
        ],
        "name": "Marvel's Iron Fist",
        "popularity": 101.916,
        "origin_country": [
          "US"
        ],
        "vote_count": 695,
        "first_air_date": "2017-03-17",
        "backdrop_path": "/xHCfWGlxwbtMeeOnTvxUCZRGnkk.jpg",
        "original_language": "en",
        "id": 62127,
        "vote_average": 6.1,
        "overview": "Danny Rand resurfaces 15 years after being presumed dead. Now, with the power of the Iron Fist, he seeks to reclaim his past and fulfill his destiny.",
        "poster_path": "/nv4nLXbDhcISPP8C1mgaxKU50KO.jpg"
      },
      {
        "original_name": "The Big Bang Theory",
        "genre_ids": [
          35
        ],
        "name": "The Big Bang Theory",
        "popularity": 100.293,
        "origin_country": [
          "US"
        ],
        "vote_count": 3335,
        "first_air_date": "2007-09-24",
        "backdrop_path": "/nGsNruW3W27V6r4gkyc3iiEGsKR.jpg",
        "original_language": "en",
        "id": 1418,
        "vote_average": 6.8,
        "overview": "The Big Bang Theory is centered on five characters living in Pasadena, California: roommates Leonard Hofstadter and Sheldon Cooper; Penny, a waitress and aspiring actress who lives across the hall; and Leonard and Sheldon's equally geeky and socially awkward friends and co-workers, mechanical engineer Howard Wolowitz and astrophysicist Raj Koothrappali. The geekiness and intellect of the four guys is contrasted for comic effect with Penny's social skills and common sense.",
        "poster_path": "/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg"
      },
      {
        "original_name": "Grey's Anatomy",
        "genre_ids": [
          18
        ],
        "name": "Grey's Anatomy",
        "popularity": 91.075,
        "origin_country": [
          "US"
        ],
        "vote_count": 802,
        "first_air_date": "2005-03-27",
        "backdrop_path": "/y6JABtgWMVYPx84Rvy7tROU5aNH.jpg",
        "original_language": "en",
        "id": 1416,
        "vote_average": 6.3,
        "overview": "Follows the personal and professional lives of a group of doctors at Seattle’s Grey Sloan Memorial Hospital.",
        "poster_path": "/mgOZSS2FFIGtfVeac1buBw3Cx5w.jpg"
      },
      {
        "original_name": "Arrow",
        "genre_ids": [
          80,
          18,
          9648,
          10759
        ],
        "name": "Arrow",
        "popularity": 90.244,
        "origin_country": [
          "US"
        ],
        "vote_count": 1989,
        "first_air_date": "2012-10-10",
        "backdrop_path": "/dKxkwAJfGuznW8Hu0mhaDJtna0n.jpg",
        "original_language": "en",
        "id": 1412,
        "vote_average": 6,
        "overview": "Spoiled billionaire playboy Oliver Queen is missing and presumed dead when his yacht is lost at sea. He returns five years later a changed man, determined to clean up the city as a hooded vigilante armed with a bow.",
        "poster_path": "/mo0FP1GxOFZT4UDde7RFDz5APXF.jpg"
      },
      {
        "original_name": "Supernatural",
        "genre_ids": [
          18,
          9648,
          10765
        ],
        "name": "Supernatural",
        "popularity": 78.692,
        "origin_country": [
          "US"
        ],
        "vote_count": 1587,
        "first_air_date": "2005-09-13",
        "backdrop_path": "/koMUCyGWNtH5LXYbGqjsUwvgtsT.jpg",
        "original_language": "en",
        "id": 1622,
        "vote_average": 7.2,
        "overview": "When they were boys, Sam and Dean Winchester lost their mother to a mysterious and demonic supernatural force. Subsequently, their father raised them to be soldiers. He taught them about the paranormal evil that lives in the dark corners and on the back roads of America ... and he taught them how to kill it. Now, the Winchester brothers crisscross the country in their '67 Chevy Impala, battling every kind of supernatural threat they encounter along the way. ",
        "poster_path": "/3iFm6Kz7iYoFaEcj4fLyZHAmTQA.jpg"
      },
      {
        "original_name": "The Simpsons",
        "genre_ids": [
          16,
          35
        ],
        "name": "The Simpsons",
        "popularity": 72.094,
        "origin_country": [
          "US"
        ],
        "vote_count": 1722,
        "first_air_date": "1989-12-17",
        "backdrop_path": "/lnnrirKFGwFW18GiH3AmuYy40cz.jpg",
        "original_language": "en",
        "id": 456,
        "vote_average": 7.1,
        "overview": "Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.",
        "poster_path": "/yTZQkSsxUFJZJe67IenRM0AEklc.jpg"
      }
    ]
  };

  // Convert to JSON to imitate real api reponse
  let sampleData = JSON.stringify(mylists);

/*
==================================================================
    INIT APP
==================================================================
*/



function init() {
    parseLocalStorageLists();
    setEventListeners();
    nav('movies,popular');
};
init();