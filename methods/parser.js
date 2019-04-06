const rp = require('request-promise');
const $ = require('cheerio');
const { RAPTORS_URL, REFERENCE_URL } = require('../private/environment');

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
    const scores = await scrapeScores();
    const teams = await scrapeOpponents();
    const dates = await scrapeDates();
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
    return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;
}

const getNumberOfGamesPlayed = async () => {
    const numberOfGamesPlayed = (await scrapeScores()).length;
    return numberOfGamesPlayed;
}

const getNumberOfGamesRemaining = async () => {
    const total = (await scrapeOpponents()).length;
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
    const teams = await scrapeOpponents();
    const dates = await scrapeDates();
    const times = await scrapeTimes();
    const scoreLength = (await scrapeScores()).length;
    const locations = await scrapeLocations();
    let output = `_Next${n > 1 ? ' ' + n + ' ' : ' '}Game${n > 1 ? 's' : ''}_: \n\n`;
    for (i = 0; i < n; i++) {
        console.log(locations[scoreLength + i]);
        if (locations[scoreLength + i] === 'Scotiabank Arena, Toronto, ON') {
            output += `RAPTORS vs ${teams[scoreLength + i]} on ${dates[scoreLength + i]} @ ${times[i]}\n`;
        } else {
            output += `RAPTORS @ ${teams[scoreLength + i]} on ${dates[scoreLength + i]} @ ${times[i]}\n`;
        }
    }
    const end = new Date().getTime();
    return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;
}

const getPlayoffMatchups = async () => {
    const start = new Date().getTime();
    const standings = await scrapeStandings();
    let output = "_Tentative Playoff Matchups_\n\n";
    for (let i = 0; i < standings.length; i++) {
        if (standings[i] == "Toronto Raptors") {
            standings[i] = "*TORONTO RAPTORS*";
            break;
        }
    }
    output += "`Eastern Conference`\n";
    output += `1. ${standings[0]} vs 8. ${standings[7]}\n`
    output += `2. ${standings[1]} vs 7. ${standings[6]}\n`
    output += `3. ${standings[2]} vs 6. ${standings[5]}\n`
    output += `4. ${standings[3]} vs 5. ${standings[4]}\n\n`

    output += "`Western Conference`\n";
    output += `1. ${standings[15]} vs 8. ${standings[22]}\n`
    output += `2. ${standings[16]} vs 7. ${standings[21]}\n`
    output += `3. ${standings[17]} vs 6. ${standings[20]}\n`
    output += `4. ${standings[18]} vs 5. ${standings[19]}\n`
    const end = new Date().getTime();
    return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;
}

const getStandings = async () => {
    const start = new Date().getTime();
    const standings = await scrapeStandings();
    let output = "_Conference Standings_\n\n";
    let index = 0;
    for (let i = 0; i < standings.length; i++) {
        if (standings[i] == "Toronto Raptors") {
            standings[i] = "*TORONTO RAPTORS*";
            break;
        }
    }

    output += "`Eastern Conference`\n";
    while (index < 15) {
        output += `${index + 1}. ${standings[index]}\n`;
        index++;
    }

    output += "\n`Western Conference`\n";
    while (index < 30) {
        output += `${index + 1 - 15}. ${standings[index]}\n`;
        index++;
    }

    const end = new Date().getTime();
    return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;
}

/* ========== SCRAPERS ========== */

const scrapeStandings = async () => {
    const html = await rp(REFERENCE_URL);
    const unparsedData = $('.standings_confs tbody .left a', html);
    let parsedData = [];

    unparsedData.each((index, element) => {
        parsedData.push($(element).text());
    });

    return parsedData
}

const scrapeScores = async () => {
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

const scrapeDates = async () => {
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
const scrapeOpponents = async () => {
    const html = await rp(RAPTORS_URL);
    const unparsedData = $('img.logo', html);
    let parsedData = [];
    unparsedData.each((index, element) => {
        parsedData.push($(element).attr('alt').toUpperCase());
    });
    return parsedData;
}

const scrapeLocations = async () => {
    const html = await rp(RAPTORS_URL);
    const unparsedData = $('span.arena', html);
    let parsedData = [];
    unparsedData.each((index, element) => {
        parsedData.push($(element).text());
    });
    return parsedData;
}

const scrapeTimes = async () => {
    const html = await rp(RAPTORS_URL);
    const unparsedData = $('.event_time', html);
    const pastGamesLength = (await scrapeScores()).length;
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
    getNumberOfGamesRemaining,
    getPlayoffMatchups,
    getStandings
}
