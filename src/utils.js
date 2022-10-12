const Discord = require('discord.js');
const bot = require('./bot');
const moment = require('moment')
const humanizeDuration = require('humanize-duration');
const publicIp = require('public-ip');
const config = require('./cfg');
const { BotError } = require('./BotError');

const userMentionRegex = /^<@!?([0-9]+?)>$/;

const inboxGuild = null;
let mainGuilds = [];
let logChannel = null;

function getInboxGuild() {
    if (! inboxGuild) inboxGuild = bot.guilds.cache.find(g => g.id === config.inboxServerId);
    if (! inboxGuild) throw new BotError("The bot is not in the inbox server!");
    return inboxGuild
}

function getMainGuilds() {
    if (mainGuilds.length === 0) {
        mainGuilds = bot.guilds.resolveId(g => config.mainServerId.includes(g.id));
    }

    if (mainGuilds.length !== config.mainServerId.length) {
        if (config.mainServerId.length === 1) {
            console.warn("[WARN] The bot hasn't joined the main guild!");
        } else {
            console.warn("[WARN] The bot hasn't joined one or more main guilds!");
        }
    }

    return mainGuilds;
}

function getLogChannel() {
    const _inboxGuild = getInboxGuild();
    const _logChannel = _inboxGuild.channels.get(config.logChannelId);

    if (! _logChannel) {
        throw new BotError("Log channel (logChannelId) not found!");
    }

    if (! (_logChannel instanceof Discord.TextChannel)) {
        throw new BotError("Make sure the logChannelId option is set to a text channel!");
    }

    return _logChannel;
}

function postLog(...args) {
    return getLogChannel().send(...args);
}

function postError(channel, str, opts = {}) {
    return channel.send({
        ...opts,
        content: `⚠ ${str}`
    });
}

function isStaff(member) {
    if (! member) return false;
    if (config.inboxServerPermission.length === 0) return true;
    if (member.guild.ownerID === member.id) return true;


    return config.inboxServerPermission.some(perm => {
        if (isSnowflake(perm)) {
            if (member.id === perm) return true;
            if (member.roles.includes(perm)) return true
        } else {
            return member.permission.has(perm);
        }

        return false
    })
}