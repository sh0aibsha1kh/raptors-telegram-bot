const TOKEN = process.env.TOKEN;
const RAPTORS_URL = process.env.URL;
const SERVER_URL = 'https://raptors-telegram-bot.herokuapp.com'
const PORT = process.env.PORT || 443;
const HOST = process.env.HOST ||'0.0.0.0';
const REFERENCE_URL = process.env.REFERENCE;

module.exports = {
    TOKEN,
    RAPTORS_URL,
    SERVER_URL,
    PORT,
    HOST,
    REFERENCE_URL
}
