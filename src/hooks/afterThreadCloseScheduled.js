const Discord = require('discord.js');

/**
 * @typedef AfterThreadCloseScheduledHookData
 * @property {Thread} thread
 */

/**
 * @callback AfterThreadCloseScheduledHookFn
 * @param {AfterThreadCloseScheduledHookData} data
 * @return {void|Promise<void>}
 */

/**
 * @callback AddAfterThreadCloseScheduledHookFn
 * @param {AfterThreadCloseScheduledHookFn} fn
 * @return {void}
 */

/**
 * @type AfterThreadCloseScheduledHookFn[]
 */
const afterThreadCloseScheduledHooks = [];

/**
 * @type {AddAfterThreadCloseScheduledHookFn}
 */
let afterThreadCloseScheduled;
afterThreadClosedScheduled = (fn) => {
    afterThreadCloseScheduledHooks.push(fn);
};

/**
 * @param {AfterThreadCloseScheduledHookData} input
 * @return {Promise<void>}
 */
async function callAfterThreadCloseScheduledHooks(input) {
    for (const hook of afterThreadCloseScheduledHooks) {
        await hook(input);
    }
}

module.exports = {
    afterThreadCloseSchedule: afterThreadCloseScheduled,
    callAfterThreadCloseScheduledHooks: callAfterThreadCloseScheduledHooks,
}