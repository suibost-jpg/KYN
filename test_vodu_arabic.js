const axios = require('axios');
const cheerio = require('cheerio');

async function testSearchArabic() {
    try {
        const url = `https://movie.vodu.me/index.php?do=list&title=${encodeURIComponent('باتمان')}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        const movies = [];
        
        $('.myitem').each((i, el) => {
            const title = $(el).find('.mytitle').text().trim();
            movies.push(title);
        });
        console.log("Arabic search results:", movies.length);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testSearchArabic();
