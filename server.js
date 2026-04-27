const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { MOVIES } = require('@consumet/extensions');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json()); // To parse JSON bodies
app.use(express.static(path.join(__dirname)));

// Helper: Read DB
function readDB() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Helper: Write DB
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// HTML serving
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- AUTHENTICATION API ---

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'الرجاء إدخال جميع البيانات' });
    }

    const users = readDB();
    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' });
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    writeDB(users);

    res.json({ success: true, message: 'تم إنشاء الحساب بنجاح', user: { name: newUser.name, email: newUser.email } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'الرجاء إدخال البريد وكلمة المرور' });
    }

    const users = readDB();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', user: { name: user.name, email: user.email } });
    } else {
        res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
});

// --- SCRAPING API ---

app.get('/api/watch', async (req, res) => {
    const { title } = req.query;
    try {
        console.log(`Searching for: ${title}`);
        const flixhq = new MOVIES.FlixHQ();

        const searchRes = await flixhq.search(title);
        if (searchRes.results && searchRes.results.length > 0) {
            const mediaId = searchRes.results[0].id;
            console.log(`Found Media ID: ${mediaId}`);

            const info = await flixhq.fetchMediaInfo(mediaId);
            if (info.episodes && info.episodes.length > 0) {
                const episodeId = info.episodes[0].id;
                const sources = await flixhq.fetchEpisodeSources(episodeId, mediaId);
                return res.json(sources);
            }
        }
        return res.status(404).json({ error: 'لم يتم العثور على روابط' });
    } catch (err) {
        console.error("Scraping error:", err);
        return res.status(500).json({ error: 'حدث خطأ في السيرفر' });
    }
});

const axios = require('axios');
const cheerio = require('cheerio');

app.get('/api/vodu/home', async (req, res) => {
    try {
        const response = await axios.get('https://movie.vodu.me', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const rows = [];
        
        $('.col-lg-12').each((i, el) => {
            const titleEl = $(el).find('h2 a');
            if (titleEl.length) {
                const title = titleEl.text().trim();
                const container = $(el).next('.col-md-12').find('.homeseries');
                if (container.length) {
                    const movies = [];
                    container.find('.myitem a').each((j, aEl) => {
                        const href = $(aEl).attr('href');
                        if (!href) return;
                        
                        let img = $(aEl).find('img').attr('src');
                        if (img && !img.startsWith('http')) {
                            img = 'https://movie.vodu.me/' + img;
                        }
                        const mTitle = $(aEl).find('.mytitle').text().trim();
                        
                        const idMatch = href.match(/id=(\d+)/);
                        const id = idMatch ? idMatch[1] : href;
                        
                        movies.push({
                            id: id,
                            title: mTitle,
                            name: mTitle, // For compatibility
                            poster_path_custom: img,
                            url: href
                        });
                    });
                    
                    if (movies.length > 0) {
                        rows.push({
                            title: title,
                            movies: movies
                        });
                    }
                }
            }
        });
        
        res.json({ success: true, rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch from Vodu' });
    }
});

app.get('/api/vodu/watch', async (req, res) => {
    const { url } = req.query;
    try {
        const fullUrl = url.startsWith('http') ? url : `https://movie.vodu.me/${url}`;
        const response = await axios.get(fullUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const playBtns = $('.play');
        const isSeries = playBtns.length > 1;
        const items = [];
        
        playBtns.each((i, el) => {
            const btn = $(el);
            const title = btn.attr('data-title') || `Episode ${i+1}`;
            const url4k = btn.attr('data-url4k');
            const url1080 = btn.attr('data-url1080');
            const url720 = btn.attr('data-url');
            const url360 = btn.attr('data-url360');
            const webvtt = btn.attr('data-webvtt');
            
            const sources = [];
            if (url4k) sources.push({ url: url4k, quality: '4k' });
            if (url1080) sources.push({ url: url1080, quality: '1080p' });
            if (url720) sources.push({ url: url720, quality: '720p' });
            if (url360) sources.push({ url: url360, quality: '360p' });
            
            const subtitles = [];
            if (webvtt) {
                subtitles.push({ lang: 'Arabic', url: webvtt });
            }
            
            items.push({
                title,
                sources,
                subtitles
            });
        });
        
        return res.json({ success: true, isSeries, items });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch video from Vodu' });
    }
});

app.get('/api/vodu/subtitles', async (req, res) => {
    const { url } = req.query;
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            responseType: 'text'
        });
        res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
        res.send(response.data);
    } catch (e) {
        res.status(500).send('Error fetching subtitles');
    }
});

app.get('/api/vodu/list', async (req, res) => {
    const { type, page, title } = req.query;
    try {
        let url;
        if (title) {
            url = `https://movie.vodu.me/index.php?do=list&title=${encodeURIComponent(title)}${page ? `&page=${page}` : ''}`;
        } else {
            url = `https://movie.vodu.me/index.php?do=list&type=${type}${page ? `&page=${page}` : ''}`;
        }
        
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        const movies = [];
        
        $('.myitem').each((i, el) => {
            const aEl = $(el).find('a').first();
            const href = aEl.attr('href');
            let img = aEl.find('img').attr('src');
            if (img && !img.startsWith('http')) {
                img = 'https://movie.vodu.me/' + img;
            }
            const mTitle = $(el).find('.mytitle').text().trim();
            const idMatch = href && href.match(/id=(\d+)/);
            if (idMatch) {
                movies.push({
                    id: idMatch[1],
                    title: mTitle,
                    poster_path_custom: img,
                    url: href
                });
            }
        });
        res.json({ success: true, movies });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch list' });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`
    =====================================================
    🚀 سيرفر "KYN" المطور يعمل الآن!
    🌐 افتح هذا الرابط: http://localhost:${PORT}
    =====================================================
    `);
    });
} else {
    module.exports = app;
}
