const { User, GuildMember, Message } = require('discord.js');

const transliterate = require('transliteration');
const moment = require('moment');
const uuid = require('uuid');
const humanizeDuration = require('humanize-duration');
const crypto = require('crypto');

const bot = require('../bot');
const knex = require('../knex');
const config = require('../cfg');
const utils = require('../utils');
const updates = require("./updates");



const MINUTES = 60 * 1000;
const HOURS = 60 * MINUTES;

let threadCreationQueue = Promise.resolve();