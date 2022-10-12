const { Discord, GatewayIntentBits } = require('discord.js');
const config = require('./cfg');

const intents = [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildBans ];

const bot = new Discord.Client({ rest: true, intents: Array.from(new Set(intents)), allowedMentions: {
    everyone: false,
    roles: false,
    users: false,
}});

bot.on("error", err => {
    throw err;
})

module.exports = bot;