const axios = require('axios');
const cheerio = require('cheerio');

async function getLinks() {
    // A movie or series link
    const res = await axios.get('https://movie.vodu.me/index.php?do=view&type=post&id=115041');
    const $ = cheerio.load(res.data);
    
    const playBtn = $('.play').first();
    console.log('url:', playBtn.attr('data-url'));
    console.log('url1080:', playBtn.attr('data-url1080'));
    console.log('url4k:', playBtn.attr('data-url4k'));
    console.log('webvtt:', playBtn.attr('data-webvtt'));
}
getLinks();
