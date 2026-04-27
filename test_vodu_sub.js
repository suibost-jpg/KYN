const axios = require('axios');

async function testVtt() {
    try {
        const res = await axios.get('https://movie.vodu.me/subtitles/From_S01E01_1762157619.webvtt', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        console.log("VTT downloaded. Length:", res.data.length);
        console.log("Starts with:", res.data.substring(0, 50));
    } catch (e) {
        console.log("Error:", e.message);
    }
}
testVtt();
