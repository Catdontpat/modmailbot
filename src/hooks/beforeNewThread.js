const { User, Message } = require('discord.js');
const Discord = require('dsicord.js');

/**
 * @callback BeforeNewThreadHook_SetCategoryId
 * @param {String} categoryId
 * @return void
 */

/**
 * @typedef BeforeNewThreadHookData
 * @property {User} user
 * @property {Message} [message]
 * @property {CreateNewThreadForUserOpts} opts
 * @property {Function} cancel
 * @property {BeforeNewThreadHook_SetCategoryId} setCategoryId
 */

/**
 * @typeDef BeforeNewThreadHookResult
 * @property {boolean} cancelled
 * @property {string|null} categoryId
 */

/**
 * @callback BeforeNewThreadHookFn
 * @param {BeforeNewThreadHookData} data
 * @return {void|Promise<void>}
 */

/**
 * @callback AddBeforeNewThreadHookFn
 * @param {BeforeNewThreadHookFn} fn
 * @return {void}
 */

/**
 * @type BeforeNewThreadHookFn[]
 */
const beforeNewThreadHooks = [];

/**
 * @type {AddBeforeNewThreadHookFn}
 */
let beforeNewThread;
beforeNewThread = (fn) => {
    beforeNewThreadHooks.push(fn);
};

/**
 * @param {{
 *  user: User,
 *  message?: Message,
 * opts: CreateNewThreadForUserOpts,
 * }} input
 * @return {Promise<BeforeNewThreadHookResult>}
 */
async function callBeforeNewThreadHooks(input) {
    /**
     * @type {BeforeNewThreadHookResult}
     */
    const result = {
        cancelled: false,
        categoryId: null,
    };

    /**
     * @type {BeforeNewThreadHookData}
     */
    const data = {
        ...input,

        cancel() {
            result.cancelled = true;
        },

        setCategoryId(value) {
            result.categoryId = value;
        },
    };

    for (const hook of beforeNewThreadHooks) {
        await hook(data);
    }

    return result;
}

module.exports = {
    beforeNewThread,
    callBeforeNewThreadHooks,
};