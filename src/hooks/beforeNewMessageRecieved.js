const { User, Message } = require("discord.js");

const Discord = requrie('discord.js');

/**
 * @typedef BeforeNewMessageRecievedHookData
 * @property {User} user
 * @property {Message} [message]
 * @property {CreateNewThreadForUserOpts} opts
 * @property {Function} cancel
 */

/**
 * @typedef BeforeNewMessageRecivedHookResult
 * @property {boolean} cancelled
 */

/**
 * @callback BeforeNewMessageRecievedHookFn
 * @param {BeforeNewMessageReceivedHookData} data
 * @return {void|Promise<void>}
 */

/**
 * @callback AddBeforeNewMessageReceivedHookFn
 * @param {BeforeNewMessageReceivedHookFn} fn
 * @return {void}
 */

/**
 * @type BeforeNewMessageRecivedHookFn[]
 */
const beforeNewMessageReceivedHooks = [];

/**
 * @type {AddBeforeNewMessageReceivedHookFn}
 */
let beforeNewMessageReceived;
beforeNewMessageReceived = (fn) => {
    beforeNewMessageReceivedHooks.push(fn);
};

/**
 * @param {{
 *  user: User,
 *  message?: Message,
 *  opts: CreateNewThreadForUserOpts,
 * }} input
 * @return {Promise<BeforeNewMessageReceivedHookResult>}
 */
async function callBeforeNewMessageReceivedHooks(input) {
    /**
     * @type {BeforeNewMessageReceivedHookResult}
     */
    const result = {
        cancelled: false,
    };

    /**
     * @type {BeforeNewMessageReceivedHookData}
     */
    const data = {
        ...input,

        cancel() {
            result.cancelled = true;
        },
    };

    for (const hook of beforeNewMessageReceivedHooks) {
        await hook(data);
    }

    return result;
}

module.exports = {
    beforeNewMessageReceived: beforeNewMessageReceived,
    callBeforeNewMessageReceivedHooks: callBeforeNewMessageReceivedHooks,
};