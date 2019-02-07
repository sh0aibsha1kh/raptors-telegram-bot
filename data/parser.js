const rp = require('request-promise');
const $ = require('cheerio');
// const puppeteer = require('puppeteer');
const { URL } = require('../private/credentials');

// TODO: live doesn't work on heroku due to a puppeteer related error
// const getLiveInfo = async () => {
//     return puppeteer.launch().then(browser => {
//         return browser.newPage();
//     }).then(page => {
//         return page.goto(LIVE).then(() => {
//             return page.content();
//         });
//     }).then(html => {
//         return `RAPTORS     ${$('.score-left', html).text()}-${$('.score-right', html).text()}     OPPONENTS\n_${$('.livegame_status', html).text().slice(1, 8)}_\n`;
//     });
// }

// const getLiveScore = async () => {
//     return puppeteer.launch().then(browser => {
//         return browser.newPage();
//     }).then(async page => {
//         await page.goto(LIVE);
//         return page.content();
//     }).then(html => {
//         return `RAPTORS ${$('.score-left', html).text()}-${$('.score-right', html).text()} 76ERS\n`;
//     });
// }

const getScores = async () => {
    const html = await rp(URL);
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
    const html = await rp(URL);
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

const getOpponents = async () => {
    const html = await rp(URL);
    const unparsedData = $('img.logo', html);
    let parsedData = [];
    unparsedData.each((index, element) => {
        parsedData.push($(element).attr('alt').toUpperCase());
    });
    return parsedData;
}

const getTimes = async () => {
    const html = await rp(URL);
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
    getDates,
    getOpponents,
    getScores,
    getTimes,
    // getLiveScore,
    // getLiveInfo
}