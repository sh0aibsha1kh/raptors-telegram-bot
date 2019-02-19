const TelegramBotAPI = require('node-telegram-bot-api');
const { TOKEN, PORT, HOST, SERVER_URL } = require('./private/credentials');
const { getNextGame, getNLastGames, getNumberOfGamesPlayed } = require('./methods/parser');

const raptorsTelegramBot = new TelegramBotAPI(TOKEN, { webHook: { port: PORT, host: HOST } });
raptorsTelegramBot.setWebHook(`${SERVER_URL}:443/bot${TOKEN}`);

raptorsTelegramBot.onText(/\/last\s*(\d*)/, async (msg, match) => {
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
