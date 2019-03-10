const rp = require('request-promise');
const $ = require('cheerio');
const { RAPTORS_URL } = require('../private/credentials');

/**
 * Returns a list of n previous games if n is valid (meaning that there are
 * at least n previous games that were played). If n is invalid, it defaults to
 * returning just the last game. The returned string is Markdown compatible.
 * 
 * @param {number} n The number of previous games to be retrieved.
 * @returns {string}
 */
const getLastNGames = async n => {
    const start = new Date().getTime();
    const scores = await getScores();
    const teams = await getOpponents();
    const dates = await getDates();
    let output = `_Last${n > 1 ? ' ' + n + ' ' : ' '}Game${n > 1 ? 's' : ''}_: \n\n`;
    for (i = scores.length - n; i < scores.length; i++) {
        let individualScores = scores[i].split('-');
        output += `${dates[i]}\n`;
        if (parseInt(individualScores[0], 10) > parseInt(individualScores[1], 10)) {
            output += `*RAPTORS*    ${scores[i]}    ${teams[i]}\n`;
        } else {
            output += `RAPTORS    ${scores[i]}    *${teams[i]}*\n`;
        }
    }
    const end = new Date().getTime();
    return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;;
}

const getNumberOfGamesPlayed = async () => {
    const numberOfGamesPlayed = (await getScores()).length;
    return numberOfGamesPlayed;
}

const getNumberOfGamesRemaining = async () => {
    const total = (await getOpponents()).length;
    const gamesPlayed = await getNumberOfGamesPlayed();
    return total - gamesPlayed;
}

/**
 * Returns a list of n next games if n is valid (meaning that there are
 * at least n next games to be played). If n is invalid, it defaults to
 * returning just the next game. The returned string is Markdown compatible.
 * 
 * @param {number} n The number of next games to be retrieved.
 * @returns {string}
 */
const getNextNGames = async n => {
    const start = new Date().getTime();
    const teams = await getOpponents();
    const dates = await getDates();
    const times = await getTimes();
    const scoreLength = (await getScores()).length;
    let output = `_Next${n > 1 ? ' ' + n + ' ' : ' '}Game${n > 1 ? 's' : ''}_: \n\n`;
    for (i = 0; i < n; i++) {
        output += `RAPTORS vs ${teams[scoreLength + i]} on ${dates[scoreLength + i]} @ ${times[i]}\n`;
    }
    const end = new Date().getTime();
    return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;;
}

/* ========== SCRAPERS ========== */

const getScores = async () => {
    const html = await rp(RAPTORS_URL);
    const unparsedData = $('.game-status__past', html).text().split(' ');
    let parsedData = [];
    for (let i = 0; i < unparsedData.length; i++) {
        if (unparsedData[i] === 'L' || unparsedData[i] === 'W') {
            continue;
        }
        if (unparsedData[i].includes('L') || unparsedData[i].includes('W')) {
            parsedData.push(unparsedData[i].slice(0, unparsedData[i].length - 1));
        }
    }
    parsedData.push(unparsedData[unparsedData.length - 1]);
    return parsedData;
}

const getDates = async () => {
    const html = await rp(RAPTORS_URL);
    const unparsedData = $('.date', html);
    let parsedData = [];
    unparsedData.each((index, element) => {
        parsedData.push($(element).text());
    });
    parsedData = parsedData.map(e => {
        const len = e.length;
        return `${e.slice(len - 11, len - 1)}`;
    })
    return parsedData;
}

/**
 * Return an array of all of the opponents that the Toronto Raptors will be
 * facing this season in order.
 */
const getOpponents = async () => {
    const html = await rp(RAPTORS_URL);
    const unparsedData = $('img.logo', html);
    let parsedData = [];
    unparsedData.each((index, element) => {
        parsedData.push($(element).attr('alt').toUpperCase());
    });
    return parsedData;
}

const getTimes = async () => {
    const html = await rp(RAPTORS_URL);
    const unparsedData = $('.event_time', html);
    const pastGamesLength = (await getScores()).length;
    let parsedData = [];
    unparsedData.each((index, element) => {
        parsedData.push($(element).text());
    });

    parsedData = parsedData.slice(pastGamesLength).map(unparsedTime => {
        if (unparsedTime === 'Live Now') {
            return '*LIVE NOW*\n';
        }
        let parsedTime = '';
        let i = 0;
        while (unparsedTime[i] !== 'm') {
            parsedTime += unparsedTime[i];
            i += 1;
        }
        parsedTime += 'm ';
        i += 1;
        while (i < unparsedTime.length) {
            parsedTime += unparsedTime[i];
            i += 1;
        }
        return parsedTime;
    });
    return parsedData;
}

module.exports = {
    getNextNGames,
    getLastNGames,
    getNumberOfGamesPlayed,
    getNumberOfGamesRemaining
}