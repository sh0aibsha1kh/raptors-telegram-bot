const rp = require('request-promise');
const $ = require('cheerio');
const TelegramBotAPI = require('node-telegram-bot-api');
const { TOKEN, URL } = require('./private/credentials');

const raptorsTelegramBot = new TelegramBotAPI(TOKEN, { polling: true });

async function getScoreData() {
    const html = await rp(URL);
    const unparsedData = $('.game-status__past', html).text().split(' ');
    let parsedData = [];
    for (let i = 0; i < unparsedData.length; i++) {
        if (unparsedData[i] === 'L' || unparsedData[i] === 'W') {
            continue;
        }
        if (unparsedData[i].includes('L') || unparsedData[i].includes('W')) {
            parsedData.push(unparsedData[i].slice(0, unparsedData[i].length - 1))
        }
    }
    parsedData.push(unparsedData[unparsedData.length - 1]);
    return parsedData;
}

async function getTeamData() {
    const html = await rp(URL);
    const unparsedData = $('img.logo', html);
    let parsedData = []
    unparsedData.each((index, element) => {
        parsedData.push($(element).attr('alt').toUpperCase());
    });
    return parsedData
}

async function getLastTenGames() {
    const scores = await getScoreData();
    const teams = await getTeamData();
    let output = '_Last 10 Games_: \n'
    for (i = scores.length - 10; i < scores.length ; i++) {
        output += `RAPTORS *${scores[i]}* ${teams[i]}\n`
    }
    return output

}

raptorsTelegramBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.toString() === '/lastTenGames') {
        raptorsTelegramBot.sendMessage(chatId, await getLastTenGames(), {parse_mode : "Markdown"})
    }
});
