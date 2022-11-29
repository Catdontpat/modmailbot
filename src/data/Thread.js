const moment = require('moment');
const Discord = require('discord.js');

const bot = require('../bot');
const knex = require('../knex');
const utils = require('../utils');
const config = require('../cfg');
const attachments = require('./attachments');
const { formatters } = require('../formatters');
const { callBeforeNewMessageReceivedHooks } = require('../hooks/beforeNewMessageRecieved');
const { callAfterNewMessageReceivedHooks } = require('../hooks/afterNewMessageReceived');
const { callAfterThreadCloseHooks } = require('../hooks/afterThreadClose');
const { callAfterThreadCloseScheduledHooks } = require('../hooks/afterThreadCloseScheduled');
const { callAfterThreadCloseScheduleCanceledHooks } = require('../hooks/afterThreadCloseScheduleCanceled');
const snippets = require('./snippets');
const { getModeratorThreadDisplayRoleName } = require('./displayRoles');

const ThreadMessage = require('./ThreadMessage');

const {THREAD_MESSAGE_TYPE, THREAD_STATUS, DISCORD_MESSAGE_ACTIVITY_TYPES} = require('./constants');
const {isBlocked} = require('./blocked');
const {messageContentToAdvancedMessageContent} = require('../utils');

const escapeFormattingRegex = new RegExp("[_`~*|]", "g");

