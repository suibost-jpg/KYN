const axios = require('axios');
const cheerio = require('cheerio');

async function testList() {
    const res = await axios.get('https://movie.vodu.me/index.php?do=list&type=2', {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    });
    const $ = cheerio.load(res.data);
    
    let count = 0;
    $('.item, .myitem').each((i, el) => {
        if (count < 3) {
            console.log('HTML:', $(el).html());
        }
        count++;
    });
}
testList();
