const axios = require('axios');
const cheerio = require('cheerio');

async function testSeries() {
    const res = await axios.get('https://movie.vodu.me/index.php?do=view&type=post&id=32372', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    const $ = cheerio.load(res.data);
    
    $('.play').each((i, el) => {
        const btn = $(el);
        if (i < 3) {
            console.log('--- Episode', i);
            console.log('Title:', btn.attr('data-title'));
            console.log('URL:', btn.attr('data-url'));
            console.log('Webvtt:', btn.attr('data-webvtt'));
        }
    });
}
testSeries();
