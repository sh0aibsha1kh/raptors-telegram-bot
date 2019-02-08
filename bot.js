const TelegramBotAPI = require('node-telegram-bot-api');
const { TOKEN } = require('./private/credentials');
const { getDates, getOpponents, getScores, getTimes } = require('./data/parser');

const raptorsTelegramBot = new TelegramBotAPI(TOKEN, { polling: true });

async function getNLastGames(n) {
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

async function getNextGame() {
    const start = new Date().getTime();
    const teams = await getOpponents();
    const dates = await getDates();
    const times = await getTimes();
    const scoreLength = (await getScores()).length;
    let output = `RAPTORS vs ${teams[scoreLength]} on ${dates[scoreLength]} @ ${times[0]}\n`;
    const end = new Date().getTime();
    return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;;
}

// TODO: live doesn't work on heroku due to a puppeteer related error
// async function getLiveUpdate() {
//     const start = new Date().getTime();
//     let output = await getLiveInfo();
//     return output + `\`------------------------\nfetched in ${(end - start) / 1000} seconds\``;
// }

raptorsTelegramBot.onText(/\/last(\d*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = parseInt(match[1], 10);
    if (number <= 0 || isNaN(number)) {
        raptorsTelegramBot.sendMessage(chatId, await getNLastGames(1), { parse_mode: 'markdown' });
    } else {
        raptorsTelegramBot.sendMessage(chatId, await getNLastGames(number), { parse_mode: 'markdown' });
    }
});

raptorsTelegramBot.on('message', async msg => {
    const chatId = msg.chat.id;
    if (msg.text === '/next') {
        raptorsTelegramBot.sendMessage(chatId, await getNextGame(), { parse_mode: 'markdown' });
    }
    // TODO: live doesn't work on heroku due to a puppeteer related error
    // if (msg.text === '/live') {
    //     raptorsTelegramBot.sendMessage(chatId, await getLiveUpdate(), { parse_mode: 'markdown' });
    // }
});
