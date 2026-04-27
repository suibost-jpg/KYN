const axios = require('axios');
const cheerio = require('cheerio');

async function testSearch() {
    try {
        const url = 'https://movie.vodu.me/index.php?do=list&title=batman';
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        const movies = [];
        
        $('.myitem').each((i, el) => {
            const aEl = $(el).find('a').first();
            const href = aEl.attr('href');
            const title = $(el).find('.mytitle').text().trim();
            movies.push({ title, href });
        });
        console.log("Found movies:", movies.length);
        console.log("First 3:", movies.slice(0, 3));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testSearch();
