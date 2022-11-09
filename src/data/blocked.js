const moment = require('moment');
const knex = require("../knex");

async function getBlockStatus(userID) {
    const row = await knex("blocked_users")
    .where("user_id", userID)
    .first();

    return {
        isBlocked: !! row,
        expiresAt: row && row.expires_at
    };
}

async function isBlocked(userID) {
    return (await getBlockStatus(userID)).isBlocked;
}

async function block(userID, userName = "", blockedBy = null, expiresAt = null) {
    if (await isBlocked(userID)) return;

    return knex("blocked_users")
    .insert({
        user_id: userID,
        user_name: userName,
        blocked_by: blockedBy,
        blocked_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
        expires_at: expiresAt
    });
}

async function unblock(userID) {
    return knex("blocked_users")
    .where("user_id", userID)
    .delete();
}

async function updateExpiryTime(userID, expiresAt) {
    return knex("blocked_users")
    .where("user_id", userID)
    .where({
        expires_at: expiresAt
    });
}

async function getExpiredBlocks() {
    const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");

    const blocks = await knex("blocked_users")
    .whereNotNull("expires_at")
    .where("expires_at", "<=", now)
    .select();

    return blocks.map(_block => _block.user_id);
}


module.exports = {
    getBlockStatus,
    isBlocked,
    block,
    unblock,
    updateExpiryTime,
    getExpiredBlocks,
};