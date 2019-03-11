const TelegramBotAPI = require('node-telegram-bot-api');
const { TOKEN, PORT, HOST, SERVER_URL } = require('./private/credentials');
const { getNextNGames, getLastNGames, getNumberOfGamesPlayed, getNumberOfGamesRemaining, getPlayoffMatchups } = require('./methods/parser');

const raptorsTelegramBot = new TelegramBotAPI(TOKEN, { webHook: { port: PORT, host: HOST } });
raptorsTelegramBot.setWebHook(`${SERVER_URL}:443/bot${TOKEN}`);

raptorsTelegramBot.onText(/\/last\s?(\d*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = parseInt(match[1], 10);
    if (number <= 0 || isNaN(number) || number > await getNumberOfGamesPlayed()) {
        raptorsTelegramBot.sendMessage(chatId, await getLastNGames(1), { parse_mode: 'markdown' });
    } else {
        raptorsTelegramBot.sendMessage(chatId, await getLastNGames(number), { parse_mode: 'markdown' });
    }
});

raptorsTelegramBot.onText(/\/next\s?(\d*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = parseInt(match[1], 10);
    if (number <= 0 || isNaN(number) || number > await getNumberOfGamesRemaining()) {
        raptorsTelegramBot.sendMessage(chatId, await getNextNGames(1), { parse_mode: 'markdown' });
    } else {
        raptorsTelegramBot.sendMessage(chatId, await getNextNGames(number), { parse_mode: 'markdown' });
    }
});

raptorsTelegramBot.onText(/\/playoffs/, async (msg, match) => {
    const chatId = msg.chat.id;
    raptorsTelegramBot.sendMessage(chatId, "HELLO", { parse_mode: 'markdown' });
    const temp = await getPlayoffMatchups();
    console.log(typeof(temp));
    console.log(temp);
});
