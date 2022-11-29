const Discord = require('discord.js');

/**
 * @typedef AfterThreadCloseScheduleCanceledHookData
 * @property {Thread} thread
 */

/**
 * @callback AfterThreadCloseScheduleCanceledHookFn
 * @param {AfterThreadCloseScheduleCanceledHookData} data
 * @return {void|Promise<void>}
 */

/**
 * @callback AddAfterThreadCloseScheduleCanceledHookFn
 * @param {AfterThreadCloseScheduleCanceledHookFn} fn
 * @return {void}
 */

/**
 * @type AfterThreadCloseScheduleCanceledHookFn[]
 */
const afterThreadCloseScheduleCanceledHooks = [];

/**
 * @type {AddAfterThreadCloseScheduleCanceledHookFn}
 */
let afterThreadCloseScheduleCanceled;
afterThreadCloseScheduleCanceled = (fn) => {
    afterThreadCloseScheduleCanceledHooks.push(fn);
}

/**
 * @param {AfterThreadCloseScheduleCanceledHookData} input
 * @return {Promise<void>}
 */
async function callAfterThreadCloseScheduleCanceledHooks(input) {
    for (const hook of afterThreadCloseScheduleCanceledHooks) {
        await hook(input);
    }
}

module.exports = {
    afterThreadCloseScheduleCanceled: afterThreadCloseScheduleCanceled,
    callAfterThreadCloseScheduleCanceledHooks: callAfterThreadCloseScheduleCanceledHooks,
};