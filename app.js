// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// TMDB API Configuration
const API_KEY = 'api_key=19f84e11932abbc79e6d83f82d6d1045';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const ONE_PIECE_ID = 37854;
const ONE_PIECE_TOTAL_EPS = 1163;

const requests = [
    { key: 'trending', title: '🔥 شائع الآن (Trending)', url: `${BASE_URL}/trending/all/week?${API_KEY}&language=ar&include_adult=false` },
    { key: 'anime', title: '🏮 أنمي (Anime)', url: `${BASE_URL}/discover/tv?${API_KEY}&with_genres=16&with_original_language=ja&language=ar&include_adult=false` },
    { key: 'kdrama', title: '🇰🇷 كيدراما (K-Dramas)', url: `${BASE_URL}/discover/tv?${API_KEY}&with_original_language=ko&language=ar&include_adult=false` },
    { key: 'turkish', title: '🇹🇷 مسلسلات تركية (Turkish Series)', url: `${BASE_URL}/discover/tv?${API_KEY}&with_original_language=tr&language=ar&include_adult=false` },
    { key: 'action', title: '💥 أفلام أكشن (Action)', url: `${BASE_URL}/discover/movie?${API_KEY}&with_genres=28&language=ar&include_adult=false` },
    { key: 'horror', title: '👻 أفلام رعب (Horror)', url: `${BASE_URL}/discover/movie?${API_KEY}&with_genres=27&language=ar&include_adult=false` },
    { key: 'one_piece', title: '🏴‍☠️ عبويوده', url: `${BASE_URL}/tv/37854?${API_KEY}&language=ar`, isSingle: true }
];

const container = document.getElementById('movie-rows-container');

// ==========================================
// STRICT NSFW FILTERING SYSTEM
// ==========================================
const NSFW_BLACKLIST = [
    'overflow', 'over-flow', 'over flow', 'ふろぉ', 'ふろ', 
    'hentai', 'ecchi', 'fan service', 'fanservice', 'erotic', 
    'adult content', 'uncensored', 'sex', '🔞', 'sexy', 
    'bikini', 'nude', 'naked', 'اوفرفلو', 'أوفرفلو', 'جنس', 'اباحي',
    'joshiochi', 'moeyo', 'adam', 'futtekita', 'harem', 'kiss', 'ero'
];
const BLACKLIST_IDS = [97005, 107412, 105822, 104278, 133228, 92143, 97005, 80148, 82705, 126485, 95204]; 

function isSafe(m) {
    if (!m) return false;
    if (m.adult) return false;
    
    const id = Number(m.id);
    if (BLACKLIST_IDS.includes(id)) return false;
    
    const title = (m.title || m.name || m.original_title || m.original_name || '').toLowerCase();
    const overview = (m.overview || '').toLowerCase();
    
    const isNSFW = NSFW_BLACKLIST.some(word => title.includes(word) || overview.includes(word));
    return !isNSFW;
}

async function fetchMovies(url) {
    try {
        // Add cache buster
        const sep = url.includes('?') ? '&' : '?';
        const finalUrl = `${url}${sep}cb=${Date.now()}`;
        
        const response = await fetch(finalUrl);
        const data = await response.json();
        return (data.results || []).filter(isSafe);
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
}

// Watchdog to clean UI every second
setInterval(() => {
    document.querySelectorAll('.poster-card').forEach(card => {
        const title = (card.innerText || '').toLowerCase();
        const imgAlt = (card.querySelector('img')?.alt || '').toLowerCase();
        // Check for Japanese titles as well
        const nsfwKeywords = [...NSFW_BLACKLIST, 'じょしおち', '悶えてよ', 'アダム'];
        if (nsfwKeywords.some(word => title.includes(word) || imgAlt.includes(word))) {
            card.remove();
        }
    });
}, 1000);

function updateHeroSection(movie) {
    const heroSection = document.getElementById('hero-section');
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-desc');

    const backdrop = movie.backdrop_path_custom || (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '');
    if (backdrop) {
        heroSection.style.transition = 'background-image 0.5s ease-in-out';
        heroSection.style.backgroundImage = `url("${backdrop}")`;
    }
    
    heroTitle.textContent = movie.title || movie.name;
    heroDesc.textContent = movie.overview ? (movie.overview.length > 150 ? movie.overview.substring(0, 150) + "..." : movie.overview) : "شاهد أحدث الأفلام والمسلسلات الآن بجودة عالية.";
}

async function renderRows() {
    container.innerHTML = '<h2 style="text-align:center; padding:50px;">جاري تحميل المحتوى من السيرفر...</h2>';
    
    try {
        const res = await fetch('/api/vodu/home');
        const data = await res.json();
        
        container.innerHTML = '';
        let isFirstRow = true;
        
        if (data.success && data.rows) {
            data.rows.forEach(row => {
                if (row.movies && row.movies.length > 0) {
                    if (isFirstRow) {
                        const randomMovie = row.movies[Math.floor(Math.random() * row.movies.length)];
                        // Make compatible with hero
                        randomMovie.backdrop_path_custom = randomMovie.poster_path_custom;
                        updateHeroSection(randomMovie);
                        isFirstRow = false;
                    }

                    const rowEl = document.createElement('div');
                    rowEl.className = 'movie-row';
                    
                    const titleEl = document.createElement('h2');
                    titleEl.className = 'row-title';
                    titleEl.textContent = row.title;
                    rowEl.appendChild(titleEl);
                    
                    const sliderContainer = document.createElement('div');
                    sliderContainer.className = 'slider-container';

                    const leftArrow = document.createElement('button');
                    leftArrow.className = 'slider-arrow left-arrow';
                    leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
                    
                    const rightArrow = document.createElement('button');
                    rightArrow.className = 'slider-arrow right-arrow';
                    rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';

                    const postersEl = document.createElement('div');
                    postersEl.className = 'row-posters';
                    
                    row.movies.forEach(movie => {
                        const posterCard = document.createElement('div');
                        posterCard.className = 'poster-card';
                        posterCard.innerHTML = `
                            <img src="${movie.poster_path_custom}" alt="${movie.title}" class="poster-img" loading="lazy">
                            <div class="poster-overlay">
                                <i class="fas fa-play-circle poster-play-icon"></i>
                                <div class="poster-title">${movie.title}</div>
                            </div>
                        `;
                        posterCard.addEventListener('click', () => openModal(movie));
                        postersEl.appendChild(posterCard);
                    });
                    
                    leftArrow.addEventListener('click', () => postersEl.scrollBy({ left: -400, behavior: 'smooth' }));
                    rightArrow.addEventListener('click', () => postersEl.scrollBy({ left: 400, behavior: 'smooth' }));
                    
                    sliderContainer.appendChild(rightArrow);
                    sliderContainer.appendChild(postersEl);
                    sliderContainer.appendChild(leftArrow);
                    rowEl.appendChild(sliderContainer);
                    container.appendChild(rowEl);
                }
            });
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<h2 style="text-align:center; padding:50px;">فشل في تحميل المحتوى</h2>';
    }
}

async function renderCategory(title, typeId) {
    container.innerHTML = '<h2 style="text-align:center; padding:50px;">جاري تحميل المحتوى...</h2>';
    try {
        const res = await fetch(`/api/vodu/list?type=${typeId}`);
        const data = await res.json();
        if (data.success && data.movies && data.movies.length > 0) {
            container.innerHTML = `<h2 class="row-title" style="margin-top:20px;">${title}</h2>`;
            const postersEl = document.createElement('div');
            postersEl.className = 'row-posters';
            postersEl.style.flexWrap = 'wrap';
            postersEl.style.justifyContent = 'center';
            postersEl.style.gap = '15px';
            
            data.movies.forEach(movie => {
                const posterCard = document.createElement('div');
                posterCard.className = 'poster-card';
                posterCard.style.margin = '0';
                posterCard.innerHTML = `
                    <img src="${movie.poster_path_custom}" alt="${movie.title}" class="poster-img" loading="lazy">
                    <div class="poster-overlay">
                        <i class="fas fa-play-circle poster-play-icon"></i>
                        <div class="poster-title">${movie.title}</div>
                    </div>
                `;
                posterCard.addEventListener('click', () => openModal(movie));
                postersEl.appendChild(posterCard);
            });
            container.appendChild(postersEl);
        } else {
            container.innerHTML = '<h2 style="text-align:center; padding:50px;">لا يوجد محتوى</h2>';
        }
    } catch (e) {
        container.innerHTML = '<h2 style="text-align:center; padding:50px;">فشل في تحميل المحتوى</h2>';
    }
}

const navLinksArray = document.querySelectorAll('.nav-links a');
navLinksArray.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinksArray.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const text = link.textContent.trim();
        if (text === 'الرئيسية') renderRows();
        else if (text === 'أفلام') renderCategory('أفلام', 0); // Vodu English Movies
        else if (text === 'مسلسلات') renderCategory('مسلسلات', 1); // Vodu TV Series
        else if (text === 'أنمي') renderCategory('أنمي', 2); // Vodu Anime Series
        else if (text === 'كيدراما') renderCategory('كيدراما', 5); // Vodu Asian Series
        else if (text === 'قائمتي' && typeof renderMyList === 'function') renderMyList();
    });
});

// Search Logic
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

let searchTimeout;
const performSearch = (queryVal) => {
    const query = typeof queryVal === 'string' ? queryVal.trim() : searchInput.value.trim();
    if (query) {
        navLinksArray.forEach(l => l.classList.remove('active'));
        renderSearch(query);
    } else {
        renderRows(); // Go back to home if search is empty
    }
};

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        if (!searchInput.value.trim()) {
            searchInput.focus();
        } else {
            performSearch();
        }
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const q = e.target.value.trim();
        searchTimeout = setTimeout(() => {
            performSearch(q);
        }, 600);
    });
}

async function renderSearch(query) {
    container.innerHTML = '<h2 style="text-align:center; padding:50px;">جاري البحث...</h2>';
    try {
        const res = await fetch(`/api/vodu/list?title=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.movies && data.movies.length > 0) {
            container.innerHTML = `<h2 class="row-title" style="margin-top:20px;">نتائج البحث عن: ${query}</h2>`;
            const postersEl = document.createElement('div');
            postersEl.className = 'row-posters';
            postersEl.style.flexWrap = 'wrap';
            postersEl.style.justifyContent = 'center';
            postersEl.style.gap = '15px';
            
            data.movies.forEach(movie => {
                const posterCard = document.createElement('div');
                posterCard.className = 'poster-card';
                posterCard.style.margin = '0';
                posterCard.innerHTML = `
                    <img src="${movie.poster_path_custom}" alt="${movie.title}" class="poster-img" loading="lazy">
                    <div class="poster-overlay">
                        <i class="fas fa-play-circle poster-play-icon"></i>
                        <div class="poster-title">${movie.title}</div>
                    </div>
                `;
                posterCard.addEventListener('click', () => openModal(movie));
                postersEl.appendChild(posterCard);
            });
            container.appendChild(postersEl);
        } else {
            container.innerHTML = `<h2 style="text-align:center; padding:50px;">لا توجد نتائج لـ "${query}"</h2>`;
        }
    } catch (e) {
        container.innerHTML = '<h2 style="text-align:center; padding:50px;">فشل في البحث</h2>';
    }
}

renderRows();

// Modal Logic
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');

let currentMovieId = null;
let currentType = 'movie';
let currentSeason = 1;
let currentEpisode = 1;

function getEmbedUrl(type, tmdbId, season=1, episode=1, isAnime=false) {
    if (isAnime) {
        return type === 'tv' ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}` : `https://vidlink.pro/movie/${tmdbId}`;
    }
    return type === 'tv' ? `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}` : `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
}

let currentMovie = null;
let isCurrentAnime = false;

async function openModal(movie) {
    currentMovie = movie;
    currentMovieId = movie.id;
    currentType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    isCurrentAnime = movie.original_language === 'ja' || (movie.genre_ids && movie.genre_ids.includes(16));

    modalTitle.textContent = movie.title || movie.name;
    modalDesc.textContent = movie.overview || "لا يوجد وصف متاح لهذا الفيلم.";
    
    const voteAverage = movie.vote_average ? (movie.vote_average * 10).toFixed(0) : '90';
    document.querySelector('.match').textContent = `مُطابق بنسبة ${voteAverage}%`;
    document.querySelector('.year').textContent = (movie.release_date || movie.first_air_date || '2026').split('-')[0];
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const tvSeasonsContainer = document.getElementById('tv-seasons-container');
    if(tvSeasonsContainer) tvSeasonsContainer.style.display = 'none';

    const videoContainer = document.querySelector('.modal-video-container');
    const originalTitle = movie.original_title || movie.original_name || movie.title || movie.name;
    
    videoContainer.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:100%; color:white; font-size:20px;"><i class="fas fa-spinner fa-spin"></i> &nbsp; جاري التحميل...</div>`;
    
    if (movie.url && movie.url.includes('do=view')) {
        // It's a Vodu Movie or Series
        try {
            const response = await fetch(`/api/vodu/watch?url=${encodeURIComponent(movie.url)}`);
            const data = await response.json();
            
            if (data && data.success && data.items && data.items.length > 0) {
                if (data.isSeries) {
                    let episodesHtml = `<h3 style="color:white; margin-bottom:15px; text-align:right;">الحلقات المتوفرة:</h3>
                    <div class="episodes-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:10px; max-height: 400px; overflow-y: auto; padding-right:10px;">`;
                    
                    data.items.forEach((ep, index) => {
                        const epTitle = ep.title ? ep.title.replace(movie.title || '', '').trim() : `حلقة ${index + 1}`;
                        episodesHtml += `<button class="vodu-ep-btn" data-index="${index}" style="background:#e50914; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;">${epTitle || `حلقة ${index+1}`}</button>`;
                    });
                    episodesHtml += `</div>`;
                    
                    videoContainer.innerHTML = episodesHtml;
                    
                    document.querySelectorAll('.vodu-ep-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const index = e.target.getAttribute('data-index');
                            const epData = data.items[index];
                            playVoduVideo(epData, videoContainer);
                        });
                    });
                } else {
                    // Single movie
                    playVoduVideo(data.items[0], videoContainer);
                }
            } else {
                videoContainer.innerHTML = `<h3 style="color:white; text-align:center; padding-top: 100px;">عذراً، لم يتم العثور على روابط تشغيل مباشرة لهذا المحتوى.</h3>`;
            }
        } catch (e) {
            videoContainer.innerHTML = `<h3 style="color:white; text-align:center; padding-top: 100px;">حدث خطأ أثناء محاولة جلب الفيديو.</h3>`;
        }
    } else {
        try {
            const response = await fetch(`/api/watch?title=${encodeURIComponent(originalTitle)}`);
            const data = await response.json();
            
            if (data && data.sources && data.sources.length > 0) {
                const hlsUrl = data.sources.find(s => s.quality === 'auto')?.url || data.sources[0].url;
                
                let subtitleTracks = '';
                if (data.subtitles && data.subtitles.length > 0) {
                    const arabicSub = data.subtitles.find(s => s.lang.toLowerCase().includes('arabic') || s.lang.toLowerCase() === 'ar');
                    if (arabicSub) {
                        subtitleTracks = `<track label="العربية" kind="subtitles" srclang="ar" src="${arabicSub.url}" default>`;
                    }
                }

                videoContainer.innerHTML = `
                    <video id="raghad-player" controls autoplay style="width:100%; height:100%; background:black; outline:none; border-radius:10px;">
                        ${subtitleTracks}
                    </video>`;
                
                const video = document.getElementById('raghad-player');
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(hlsUrl);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = hlsUrl;
                    video.addEventListener('loadedmetadata', () => video.play());
                }
            } else {
                let embedUrl = getEmbedUrl(currentType, currentMovieId, 1, 1, isCurrentAnime);
                videoContainer.innerHTML = `<iframe id="video-iframe" width="100%" height="100%" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
            }
        } catch (e) {
            let embedUrl = getEmbedUrl(currentType, currentMovieId, 1, 1, isCurrentAnime);
            videoContainer.innerHTML = `<iframe id="video-iframe" width="100%" height="100%" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
        }
    }

    if (currentType === 'tv' && tvSeasonsContainer) {
        tvSeasonsContainer.style.display = 'block';
        if (Number(currentMovieId) === ONE_PIECE_ID) {
            showOnePieceEpisodes();
        } else {
            fetchTvDetails(movie.id);
        }
    }
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    const videoContainer = document.querySelector('.modal-video-container');
    videoContainer.innerHTML = `<div class="video-placeholder"><i class="fas fa-play-circle play-icon-large"></i><p>سيتم تشغيل الفيلم هنا...</p></div>`;
    // Reset One Piece UI
    const opSearchBar = document.querySelector('.op-ep-search-bar');
    if (opSearchBar) opSearchBar.remove();
    const episodesList = document.getElementById('episodes-list');
    if (episodesList) {
        episodesList.className = 'episodes-list';
        episodesList.innerHTML = '';
    }
    const seasonSelector = document.getElementById('season-selector');
    if (seasonSelector) seasonSelector.style.display = '';
}

closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

async function fetchTvDetails(tvId) {
    try {
        const res = await fetch(`${BASE_URL}/tv/${tvId}?${API_KEY}&language=ar`);
        const tvData = await res.json();
        const seasonSelector = document.getElementById('season-selector');
        if(!seasonSelector) return;
        seasonSelector.innerHTML = '';
        
        if (tvData.seasons) {
            const seasons = tvData.seasons.filter(s => s.season_number > 0);
            seasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = season.name || `الموسم ${season.season_number}`;
                seasonSelector.appendChild(option);
            });
            if(seasons.length > 0) {
                seasonSelector.value = seasons[0].season_number;
                fetchEpisodes(tvId, seasons[0].season_number);
            }
            seasonSelector.onchange = (e) => fetchEpisodes(tvId, e.target.value);
        }
    } catch(err) { console.error(err); }
}

async function fetchEpisodes(tvId, seasonNumber) {
    const episodesList = document.getElementById('episodes-list');
    if(!episodesList) return;
    episodesList.innerHTML = '<div style="text-align:center; padding:20px;">جاري تحميل الحلقات...</div>';
    try {
        const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?${API_KEY}&language=ar`);
        const seasonData = await res.json();
        episodesList.innerHTML = '';
        if (seasonData.episodes) {
            seasonData.episodes.forEach(episode => {
                const epEl = document.createElement('div');
                epEl.className = 'episode-item';
                const imgPath = episode.still_path ? IMG_URL + episode.still_path : 'https://via.placeholder.com/120x70?text=لا+توجد+صورة';
                epEl.innerHTML = `
                    <img src="${imgPath}" alt="${episode.name}" class="episode-img" loading="lazy">
                    <div class="episode-info">
                        <div class="episode-title">الحلقة ${episode.episode_number}: ${episode.name}</div>
                        <div class="episode-desc">${episode.overview || 'لا يوجد وصف متاح'}</div>
                    </div>
                `;
                epEl.addEventListener('click', () => {
                    const iframe = document.getElementById('video-iframe');
                    if(iframe) iframe.src = getEmbedUrl('tv', tvId, seasonNumber, episode.episode_number, isCurrentAnime);
                    document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
                    epEl.classList.add('active');
                    document.querySelector('.modal-content').scrollTo({top: 0, behavior: 'smooth'});
                });
                episodesList.appendChild(epEl);
            });
        }
    } catch(err) { console.error(err); }
}

// ==========================================
// ONE PIECE SPECIAL EPISODE BROWSER
// ==========================================

// Direct MP4/video URLs for specific episodes (add more here)
const ONE_PIECE_DIRECT_URLS = {
    1155: 'https://movie.vodu.me:8888/videos/One_Piece_E1155_1766978700-1080.mp4',
    1156: 'https://movie.vodu.me:8888/videos/One_Piece_E1156_1775413661-1080.mp4',
    1157: 'https://movie.vodu.me:8888/videos/One_Piece_E1157_1776023627-1080.mp4',
    1158: 'https://movie.vodu.me:8888/videos/One_Piece_E1158_1776625828-1080.mp4',
};

// Cache for One Piece episode map: [null, {season, episode}, ...]
let onePieceEpisodeMap = null;

async function buildOnePieceMap() {
    if (onePieceEpisodeMap) return onePieceEpisodeMap;
    try {
        // Step 1: Get all seasons
        const tvRes = await fetch(`${BASE_URL}/tv/${ONE_PIECE_ID}?${API_KEY}`);
        const tvData = await tvRes.json();
        const seasons = (tvData.seasons || []).filter(s => s.season_number > 0);

        // Step 2: Fetch all seasons in parallel
        const seasonDataArr = await Promise.all(
            seasons.map(s =>
                fetch(`${BASE_URL}/tv/${ONE_PIECE_ID}/season/${s.season_number}?${API_KEY}`)
                    .then(r => r.json())
                    .then(d => ({ seasonNum: s.season_number, episodes: d.episodes || [] }))
                    .catch(() => ({ seasonNum: s.season_number, episodes: [] }))
            )
        );

        // Step 3: Sort by season and build absolute episode map
        seasonDataArr.sort((a, b) => a.seasonNum - b.seasonNum);
        const map = [null]; // index 0 unused — map is 1-indexed
        for (const { seasonNum, episodes } of seasonDataArr) {
            episodes.sort((a, b) => a.episode_number - b.episode_number);
            for (const ep of episodes) {
                map.push({ season: seasonNum, episode: ep.episode_number });
            }
        }

        // Step 4: Extend map for episodes beyond TMDB data (1000+)
        // TMDB might not have the latest episodes — extrapolate from last known season
        if (map.length - 1 < ONE_PIECE_TOTAL_EPS) {
            const lastKnown = map[map.length - 1];
            let nextEp = lastKnown ? lastKnown.episode + 1 : 1;
            let lastSeason = lastKnown ? lastKnown.season : 1;
            for (let i = map.length; i <= ONE_PIECE_TOTAL_EPS; i++) {
                map.push({ season: lastSeason, episode: nextEp++ });
            }
        }

        onePieceEpisodeMap = map;
        return map;
    } catch (e) {
        console.error('Failed to build One Piece map:', e);
        // Emergency fallback: build a rough map using known One Piece season structure
        const map = [null];
        // Approximate TMDB season breakdown for One Piece
        const seasonLengths = [61,61,13,26,8,52,33,35,73,45,26,37,58,62,50,118,36,95,17,76,132,179,95];
        let s = 1;
        for (const len of seasonLengths) {
            for (let e = 1; e <= len && map.length <= ONE_PIECE_TOTAL_EPS; e++) {
                map.push({ season: s, episode: e });
            }
            s++;
        }
        // Fill any remaining
        const last = map[map.length - 1];
        let nextEp = last ? last.episode + 1 : 1;
        while (map.length <= ONE_PIECE_TOTAL_EPS) {
            map.push({ season: last ? last.season : s, episode: nextEp++ });
        }
        onePieceEpisodeMap = map;
        return map;
    }
}

async function showOnePieceEpisodes() {
    const tvContainer = document.getElementById('tv-seasons-container');
    const episodesList = document.getElementById('episodes-list');
    const seasonSelector = document.getElementById('season-selector');
    if (!episodesList || !tvContainer) return;

    if (seasonSelector) seasonSelector.style.display = 'none';

    // Show loading state
    episodesList.className = 'op-episodes-grid';
    episodesList.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:#aaa;">⚓ جاري تحميل خريطة الحلقات...</div>';

    // Add jump-to-episode search bar
    if (!document.querySelector('.op-ep-search-bar')) {
        const searchBar = document.createElement('div');
        searchBar.className = 'op-ep-search-bar';
        searchBar.innerHTML = `
            <input type="number" id="op-ep-input" min="1" max="${ONE_PIECE_TOTAL_EPS}"
                   placeholder="🔍 اذهب للحلقة (1 - ${ONE_PIECE_TOTAL_EPS})">
            <button id="op-ep-go">انتقل</button>
        `;
        tvContainer.insertBefore(searchBar, episodesList);

        document.getElementById('op-ep-go').addEventListener('click', () => {
            const num = parseInt(document.getElementById('op-ep-input').value);
            if (num >= 1 && num <= ONE_PIECE_TOTAL_EPS) {
                const btn = document.getElementById(`op-ep-${num}`);
                if (btn) {
                    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    btn.click();
                }
            }
        });
        document.getElementById('op-ep-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('op-ep-go').click();
        });
    }

    // Fetch real season/episode mapping from TMDB
    const epMap = await buildOnePieceMap();

    // Build episodes grid — show all episodes
    episodesList.innerHTML = '';
    for (let i = 1; i <= ONE_PIECE_TOTAL_EPS; i++) {
        const btn = document.createElement('div');
        btn.className = 'op-ep-btn';
        btn.id = `op-ep-${i}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
            const videoContainer = document.querySelector('.modal-video-container');

            // Get correct season/episode from TMDB map
            let season = 1, episode = i;
            if (epMap && epMap[i]) {
                season = epMap[i].season;
                episode = epMap[i].episode;
            }

            // Build servers list
            const servers = [
                { name: '▶ سيرفر MoviesAPI', url: `https://moviesapi.club/tv/${ONE_PIECE_ID}-${season}-${episode}`, isDirect: false },
                { name: '▶ سيرفر 2Embed', url: `https://www.2embed.cc/embedtv/${ONE_PIECE_ID}&s=${season}&e=${episode}`, isDirect: false },
                { name: '▶ سيرفر MultiEmbed', url: `https://multiembed.mov/direct/stream.php?video_id=${ONE_PIECE_ID}&tmdb=1&s=${season}&e=${episode}`, isDirect: false }
            ];

            videoContainer.innerHTML = `
                <div class="op-server-bar">
                    ${servers.map((s, idx) => `
                        <button class="op-server-btn ${idx === 0 ? 'active' : ''}"
                            onclick="opSwitchServer('${s.url}', ${s.isDirect}, ${i}, this)">${s.name}</button>
                    `).join('')}
                </div>
                ${opBuildPlayer(servers[0], i)}
            `;

            document.querySelectorAll('.op-ep-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelector('.modal-content').scrollTo({ top: 0, behavior: 'smooth' });
        });
        episodesList.appendChild(btn);
    }
}

// Build the correct player element based on URL type
function opBuildPlayer(server, episodeNum) {
    if (server.isDirect) {
        return `<video id="op-direct-video" controls autoplay crossorigin="anonymous"
            src="${server.url}"
            style="width:100%;height:calc(100% - 48px);background:#000;
                   display:block;border-radius:0 0 10px 10px;outline:none;">
            <track id="ar-sub" label="العربية" kind="subtitles" srclang="ar"
                   src="/api/subtitles?episode=${episodeNum}" default>
        </video>`;
    }
    return `<iframe id="op-video-iframe" width="100%"
        height="calc(100% - 48px)"
        src="${server.url}"
        frameborder="0" allowfullscreen
        style="display:block;border-radius:0 0 10px 10px;">
    </iframe>`;
}

// Switch server for One Piece player
window.opSwitchServer = function(url, isDirect, episodeNum, clickedBtn) {
    const container = document.querySelector('.modal-video-container');
    const oldIframe = document.getElementById('op-video-iframe');
    const oldVideo  = document.getElementById('op-direct-video');
    if (oldIframe) oldIframe.remove();
    if (oldVideo)  oldVideo.remove();
    const tmp = document.createElement('div');
    tmp.innerHTML = opBuildPlayer({ url, isDirect }, episodeNum);
    container.appendChild(tmp.firstElementChild);
    document.querySelectorAll('.op-server-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');
};

// Old search and nav logic removed

document.getElementById('add-to-list-btn').addEventListener('click', () => {
    if (!currentMovie) return;
    let myList = JSON.parse(localStorage.getItem('wnsa_mylist')) || [];
    if (!myList.find(m => m.id === currentMovie.id)) {
        myList.push(currentMovie);
        localStorage.setItem('wnsa_mylist', JSON.stringify(myList));
        alert('تمت الإضافة للقائمة!');
    }
});

function renderMyList() {
    container.innerHTML = '';
    let myList = (JSON.parse(localStorage.getItem('wnsa_mylist')) || []).filter(isSafe);
    localStorage.setItem('wnsa_mylist', JSON.stringify(myList));
    if (myList.length === 0) {
        container.innerHTML = `<h2 class="row-title" style="text-align:center; margin-top:50px;">قائمتك فارغة 🍿</h2>`;
        return;
    }
    const postersEl = document.createElement('div');
    postersEl.className = 'row-posters';
    postersEl.style.flexWrap = 'wrap';
    myList.forEach(movie => {
        const posterCard = document.createElement('div');
        posterCard.className = 'poster-card';
        posterCard.innerHTML = `<img src="${IMG_URL + movie.poster_path}" alt="${movie.title || movie.name}" class="poster-img">`;
        posterCard.addEventListener('click', () => openModal(movie));
        postersEl.appendChild(posterCard);
    });
    container.appendChild(postersEl);
}

// Authentication Logic (Real API)
const loginBtn = document.getElementById('login-btn');
const loginModalOverlay = document.getElementById('login-modal-overlay');
const closeLoginBtn = document.getElementById('close-login-btn');
const profileIcon = loginBtn ? loginBtn.querySelector('i') : null;

if (loginBtn && profileIcon) {
    let storedUser = localStorage.getItem('wnsa_user');
    if (storedUser) {
        profileIcon.classList.replace('fa-user', 'fa-check-circle');
        profileIcon.style.color = '#46d369';
    }
    loginBtn.addEventListener('click', () => {
        if (localStorage.getItem('wnsa_user')) {
            if(confirm('هل تريد تسجيل الخروج؟')) {
                localStorage.removeItem('wnsa_user');
                location.reload();
            }
            return;
        }
        loginModalOverlay.classList.add('active');
    });
    closeLoginBtn.addEventListener('click', () => loginModalOverlay.classList.remove('active'));
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (data.success) { localStorage.setItem('wnsa_user', JSON.stringify(data.user)); location.reload(); }
    else alert(data.error);
});

function playVoduVideo(epData, container) {
    if (!epData || !epData.sources || epData.sources.length === 0) {
        container.innerHTML = `<h3 style="color:white; text-align:center; padding-top: 100px;">حدث خطأ: لا توجد روابط تشغيل.</h3>`;
        return;
    }
    const videoUrl = epData.sources[0].url; 
    let subtitleTracks = '';
    if (epData.subtitles && epData.subtitles.length > 0) {
        const proxyUrl = `/api/vodu/subtitles?url=${encodeURIComponent(epData.subtitles[0].url)}`;
        subtitleTracks = `<track label="العربية" kind="subtitles" srclang="ar" src="${proxyUrl}" default>`;
    }
    
    container.innerHTML = `
        <video id="raghad-player" controls autoplay style="width:100%; height:100%; background:black; outline:none; border-radius:10px;" crossorigin="anonymous">
            <source src="${videoUrl}" type="video/mp4">
            ${subtitleTracks}
        </video>`;
}
