const TelegramBotAPI = require('node-telegram-bot-api');
const { TOKEN, PORT, HOST, SERVER_URL } = require('./private/environment');
const { getNextNGames, getLastNGames, getNumberOfGamesPlayed, getNumberOfGamesRemaining, getPlayoffMatchups, getStandings } = require('./methods/parser');

const raptorsTelegramBot = new TelegramBotAPI(TOKEN, { webHook: { port: PORT, host: HOST } });
raptorsTelegramBot.setWebHook(`${SERVER_URL}:443/bot${TOKEN}`);

raptorsTelegramBot.onText(/\/last\s?(\d*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = parseInt(match[1], 10);
    const playedGames = await getNumberOfGamesPlayed();
    if (number <= 0 || isNaN(number)) {
        raptorsTelegramBot.sendMessage(chatId, await getLastNGames(1), { parse_mode: 'markdown' });
    } else if (number > playedGames) {
        raptorsTelegramBot.sendMessage(chatId, await getLastNGames(playedGames), { parse_mode: 'markdown' });
    } else {
        raptorsTelegramBot.sendMessage(chatId, await getLastNGames(number), { parse_mode: 'markdown' });
    }
});

raptorsTelegramBot.onText(/\/next\s?(\d*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const number = parseInt(match[1], 10);
    const remainingGames = await getNumberOfGamesRemaining();
    if (number <= 0 || isNaN(number)) {
        raptorsTelegramBot.sendMessage(chatId, await getNextNGames(1), { parse_mode: 'markdown' });
    } else if (number > remainingGames) {
        raptorsTelegramBot.sendMessage(chatId, await getNextNGames(remainingGames), { parse_mode: 'markdown' });
    } else {
        raptorsTelegramBot.sendMessage(chatId, await getNextNGames(number), { parse_mode: 'markdown' });
    }
});

raptorsTelegramBot.onText(/\/playoffs/, async (msg, match) => {
    const chatId = msg.chat.id;
    raptorsTelegramBot.sendMessage(chatId, await getPlayoffMatchups(), { parse_mode: 'markdown' });
});

raptorsTelegramBot.onText(/\/standings/, async (msg, match) => {
    const chatId = msg.chat.id;
    raptorsTelegramBot.sendMessage(chatId, await getStandings(), { parse_mode: 'markdown' });
});

raptorsTelegramBot.onText(/\/husnain/, async (msg, match) => {
    const chatId = msg.chat.id;
    raptorsTelegramBot.sendMessage(chatId, "Be Alert!", { parse_mode: 'markdown' });
    setTimeout(() => {
        raptorsTelegramBot.sendMessage(chatId, "Hands out of your pants!", { parse_mode: 'markdown' });
    }, 5000);
});