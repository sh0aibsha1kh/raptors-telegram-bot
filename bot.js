const TelegramBotAPI = require('node-telegram-bot-api');
const { TOKEN } = require('./private/credentials');
const { getNextGame, getNLastGames, getNumberOfGamesPlayed } = require('./methods/parser');

const port = process.env.PORT || 443;
const host = process.env.HOST ||'0.0.0.0';
const externalUrl = 'https://raptors-telegram-bot.herokuapp.com'
const raptorsTelegramBot = new TelegramBotAPI(TOKEN, { webHook: { port : port, host : host } });
raptorsTelegramBot.setWebHook(`${externalUrl}:443/bot${TOKEN}`);

raptorsTelegramBot.onText(/\/last(\d*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = parseInt(match[1], 10);
    if (number <= 0 || isNaN(number) || number > await getNumberOfGamesPlayed()) {
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
});
