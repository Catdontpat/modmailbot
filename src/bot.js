const Discord = require('discord.js');
const config = require('./cfg');

const intents = [

]

const bot = new Discord.Client({ rest: true, intents: Array.from(new Set(intents)), allowedMentions: {
    everyone: false,
    roles: false,
    users: false,
}});

bot.on("error", err => {
    throw err;
})

module.exports = bot;