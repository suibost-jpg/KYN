const axios = require('axios');
const fs = require('fs');

async function test() {
    const res = await axios.get('https://movie.vodu.me', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    fs.writeFileSync('vodu_home.html', res.data);
    console.log('Saved to vodu_home.html');
}
test();
