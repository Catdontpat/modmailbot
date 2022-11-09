const Discord = require('discord.js');

/**
 * @typedef AfterNewMessageReceivedData
 * @property {Discord.User} user
 * @property {Discord.Message} [message]
 * @property {CreateNewThreadForUserOps} options
 */


/**
 * @callback AfterNewMessageReceivedHookFn
 * @param {AfterNewMessageReceivedData} data
 * @return {void}
 */

/**
 * @callback AddAfterNewMessageReceivedHookFn
 * @param {AfterNewMessageReceivedHookFn} fn
 * @return {void}
 */


/**
 * @type AfterNewMessageReceivedHookFn[]
 */
const afterNewMessageReceivedHooks = [];

/**
 * @type {AddAfterNewMessageReceivedHookFn}
 */
let afterNewMessageReceived;
afterNewMessageReceived = (fn) => {
    afterNewMessageReceivedHooks.push(fn);
};

/**
 * 
 * @param {{
 * user: Discord.User,
 * message?: Discord.Message,
 * opts: CreateNewThreadForUserOpts,
 * }} input 
 */

async function callAfterNewMessageReceivedHooks(input) {
    for (const hook of afterNewMessageReceivedHooks) {
        await hook(input);
    }
}

module.exports = {
    afterNewMessageReceived: afterNewMessageReceived,
    callAfterNewMessageReceivedHooks: callAfterNewMessageReceivedHooks,
};