const Discord = require('discord.js');

/**
 * @typedef AfterThreadCloseHookData
 * @property {string} threadId
 */

/**
 * @callback AfterThreadCloseHookFn
 * @param {AfterThreadCloseHookData} data
 * @return {void|Promise<void>}
 */

/**
 * @callback AddAfterThreadCloseHookFn
 * @param {AfterThreadCloseHookfn} fn
 * @return {void}
 */

/**
 * @type AfterThreadCloseHookFn[]
 */
const afterThreadCloseHooks = [];

/**
 * @type {AddAfterThreadCloseHookFn}
 */
let afterThreadClose;
afterThreadClose = (fn) => {
    afterThreadCloseHooks.push(fn);
}

/**
 * @param {AfterThreadCloseHookData} input
 * @return {Promise<void>}
 */
async function callAfterThreadCloseHooks(input) {
    for (const hook of afterThreadCloseHooks) {
        await hook(input);
    }
}

module.exports = {
    afterThreadClose,
    callAfterThreadCloseHooks,
};