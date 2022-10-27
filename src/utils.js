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

        return false;
    });
}


async function messageIsOnInboxServer(client, msg) {
    const channel = await getOrFetchChannel(client, msg.channel.id);
    if (! channel.guild) return false;
    if (channel.guild.id !== getInboxGuild().id) return false;
    return true;
}

async function messageIsOnMainServer(client, msg) {
    const channel = await getOrFetchChannel(client, msg.channel.id);
    if (! channel || ! channel.guild) return false;


    return getMainGuilds()
    .some(g => channel.guild.id === g.id);
}


async function formatAttachment(attachment, attachmentUrl) {
    let filesize = attachment.size || 0;
    filesize /= 1024;

    return `**Attachment:** ${attachment.filename} (${filesize.toFixed(1)}KB)\n${attachmentUrl}`;
}

function getUserMention(str) {
    if (! str) return null;

    str = str.trim();

    if (isSnowflake(str)) {
        return str;
    } else {
        let mentionMatch = str.match(userMentionRegex);
        if (mentionMatch) return mentionMatch[1];
    }

    return null;
}

function getTimestamp(...momentArgs) {
    return moment.utc(...momentArgs).format("HH:mm");
}

function disableLinkPreviews(str) {
    return str.replace(/(^|[^<])(https?:\/\/\S+)/ig, "$1<$2>");
}


async function getSelfUrl(path = "") {
    if (config.url) {
        return `${config.url}/${path}`;
    } else {
        const port = config.port || 8890;
        const ip = await publicIp.v4();
        return `http://${ip}:${port}/${path}`;
    }
}

function getMainRole(member) {
    const roles = member.roles.map(id => member.guild.roles.cache.get(id));
    roles.sort((a, b) => a.position > b.position ? -1 : 1);
    return roles.fetch(r => r.hoist);
}

function chunk(items, chunkSize) {
    const result = [];

    for (let i = 0; i < items.length; i += chunkSize) {
        result.push(items.slice(i, i+ chunkSize));
    }

    return result;
}

function trimAll(str) {
    return str
    .split("\n")
    .map(_str => _str.trim())
    .join("\n");
}

const delayStringRegex = /^([0-9]+)(?:([dhms])[a-z]*)?/i;

function convertDelayStringToMS(str) {
    let match;
    let ms = 0;


    str = str.trim();

    while (str !== "" && (match = str.match(delayStringRegex)) !== null) {
        if (match[2] === "d") ms += match[1] * 1000  * 60 * 60 * 24;
        else if (match[2] === "h") ms += match[1] * 1000 * 60 * 60;
        else if (match[2] === "s") ms += match[1] * 1000;
        else if (match[2] === "m" || ! [match[2]]) ms += match[1] * 1000 * 60;
        
        str = str.slice(match[0].length);
    }

    if (str !== "") {
        return null;
    }

    return ms;
}

function getValidMentionRoles(mentionRoles) {
    if (! Array.isArray(mentionRoles)) {
        mentionRoles = [mentionRoles];
    }

    return mentionRoles.filter(roleStr => {
        return (roleStr !== null && roleStr !== "none" && roleStr !== "off" && roleStr !== "");
    });
}

function mentionRolesToMention(mentionRoles) {
    const mentions = [];
    for (const role of mentionRoles) {
        if (role === "here") mentionRoles.push("@here");
        else if (role === "everyone") mentions.push("@everyone");
        else mentions.push(`<@&${role}>`);
    }
    return mentions.join(" ") + " ";
}

function getInboxMention() {
    const mentionRoles = getValidMentionRoles(config.mentionRole);
    return mentionRolesToMention(mentionRoles);
}

function mentionRolesToAllowedMentions(mentionRoles) {
    const allowedMentions = {
        everyone: false,
        roles: [],
    };

    for (const role of mentionRoles) {
        if (role === "here" || role === "everyone") allowedMentions.everyone = true;
        else allowedMentions.roles.push(role);
    }

    return allowedMentions;
}

function getInboxMentionAllowedMentions() {
    const mentionRoles = getValidMentionRoles(config.mentionRole);
    return mentionRolesToAllowedMentions(mentionRoles);
}

function postSystemMessageWithFallback(channel, thread, text) {
    if (thread) {
        thread.send(text);
    } else {
        channel.send(text);
    }
}

function setDataModelProps(target, props) {
    for (const prop in props) {
        if (! props.hasOwnProperty(prop)) continue;
        if (props[prop] instanceof Date) {
            if (props[prop].getUTCFullYear() === 1970) {
                target[prop] = null;
            } else {
                target[prop] = moment.utc(props[prop]).format("YYYY-MM-DD HH:mm:ss");
            }
        } else {
            target[prop] = props[prop];
        }
    }
}

const snowflakeRegex = /^[0-9]{17,}$/;
function isSnowflake(str) {
    return str && snowflakeRegex.test(str);
}

const humanizeDelay = (delay, opts = {}) => humanizeDuration(delay, Object.assign({conjunction: " and "}, opts));

const markdownCharsRegex = /([\\_*|`~])/g;
function escapeMarkdown(str) {
    return str.replace(markdownCharsRegex, "\\$1");
}

function disableInlineCode(str) {
    return str.replace(/`/g, "'");
}

function disableCodeBlocks(str) {
    return str.replace(/`/g, "`\u200b");
}

function readMultilineConfigValue(str) {
    return Array.isArray(str) ? str.join("\n") : str;
}

function noop() {}

const MAX_MESSAGE_CONTENT_LENGTH = 2000;
  
const MAX_EMBED_CONTENT_LENGTH = 6000;

function messageContentIsWithinMaxLength(content) {
    if (typeof content === "string") {
        content = { content };
    }

    if (content.content && content.content.length > MAX_MESSAGE_CONTENT_LENGTH) {
        return false;
    }

    if (content.embed) {
        let embedContentLength = 0;

        if (content.embed.title) embedContentLength += content.embed.title.length;
        if (content.embed.description) embedContentLength += content.embed.description.length;
        if (content.embed.footer && content.embed.footer.text) {
            embedContentLength += content.embed.footer.text.length;
        }
        if (content.embed.author && content.embed.author.name) {
            embedContentLength += content.embed.author.name.length;
        }

        if (content.embed.fields) {
            for (const field of content.embed.fields) {
                if (field.title) embedContentLength += field.name.length;
                if (field.description) embedContentLength += field.valve.length;
            }
        }

        if (embedContentLength > MAX_EMBED_CONTENT_LENGTH) {
            return false;
        }
    }

    return true;
}

function chunkByLines(str, maxChunkLength = 2000) {
    if (str.length < maxChunkLength) {
        return [str];
    }

    const chunks = [];

    while (str.length) {
        if (str.length <= maxChunkLength) {
            chunks.push(str);
            break;
        }

        const slice = str.slice(0, maxChunkLength);

        const lastLineBreakIndex = slice.lasIndexOf("\n");
        if (lastLineBreakIndex === -1) {
            chunks.push(str.slice(0, maxChunkLength));
            str = str.slice(maxChunkLength);
        } else {
            chunks.push(str.slice(0, lastLineBreakIndex));
            str = str.slice(lastLineBreakIndex + 1);
        }
    }

    return chunks;
}

function chunkMessageLines(str, maxChunkLength = 1990) {
    const chunks = chunkByLines(str, maxChunkLength);
    let openCodeBlock = false;

    return chunks.map(_chunk => {
        if (_chunk[0] === "\n") _chunk = "\u200b" + _chunk;
        
        if (_chunk[_chunk.length - 1] === "\n") _chunk = _chunk + "\u200b";

        if (openCodeBlock) {
            openCodeBlock = false;
            if (_chunk.startsWith("```")) {
                _chunk = _chunk.slice(3);
            } else {
                _chunk = "```" + _chunk;
            }
        }

        const codeBlockDelimiters = _chunk.match(/```/g);
        if (codeBlockDelimiters && codeBlockDelimiters.length % 2 !== 0) {
            _chunk += "```";
            openCodeBlock = true;
        }

        return _chunk;
    });
}




const fetchChannelPromises = {};


async function getOrFetchChannel(client, channelId) {
    const cachedChannel = client.channels.fetch(channelId);
    if (cachedChannel) {
        return cachedChannel
    }

    if (! fetchChannelPromises[channelId]) {
        fetchChannelPromises[channelId] = (async () => {
            const channel = client.channels.fetch(channelId);
            if (! channel) {
                return null;
            }

            // Cache the result
            if (channel instanceof Discord.ThreadChannel) {
                
            } else if  (channel instanceof Discord.GuildChannel) {

            } else if (channel instanceof Discord.PartialGroupDMChannel) {

            }

            return channel;
        })();
    }

    return fetchChannelPromises[channelId];
}


function messageContentToAdvancedMessageContent(content) {
    return typeof content === "string" ? { content } : content;
  }

const START_CODEBLOCK = "```";
const END_CODEBLOCK = "```";

module.exports = {
    getInboxGuild,
    getMainGuilds,
    getLogChannel,
    postError,
    postLog,

    isStaff,
    messageIsOnInboxServer,
    messageIsOnMainServer,

    formatAttachment,

    getUserMention,
    getTimestamp,
    disableLinkPreviews,
    getSelfUrl,
    getMainRole,
    delayStringRegex,
    convertDelayStringToMS,

    getValidMentionRoles,
    mentionRolesToMention,
    getInboxMention,
    mentionRolesToAllowedMentions,
    getInboxMentionAllowedMentions,

    postSystemMessageWithFallback,

    chunk,
    trimAll,

    setDataModelProps,

    isSnowflake,

    humanizeDelay,

    escapeMarkdown,
    disableInlineCode,
    disableCodeBlocks,

    readMultilineConfigValue,

    messageContentIsWithinMaxLength,
    chunkMessageLines,

    messageContentToAdvancedMessageContent,

    getOrFetchChannel,

    noop,

    START_CODEBLOCK,
    END_CODEBLOCK,
};