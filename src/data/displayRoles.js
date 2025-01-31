const knex = require('knex');
const Discord = require('discord.js');
const utils = require('../utils');
const config = require('../cfg');

/**
 * @param {string} moderatorId
 * @returns {Promise<string|null>}
 */
async function getModeratorDefaultRoleOverride(moderatorId) {
    const roleOverride = await knex('moderator_role_overrides')
    .where("moderator_id", moderatorId)
    .whereNull("thread_id")
    .first();

    return roleOverride ? roleOverride.role_id : null;
}

/**
 * @param {string} moderatorId
 * @param {string} roleId 
 * @returns {Promise<void>}
 */

async function setModeratorDefaultRoleOverride(moderatorId, roleId) {
    const existingGlobalOverride = await getModeratorDefaultRoleOverride(moderatorId);
    if (existingGlobalOverride) {
        await knex("moderator_role_overrides")
        .where("moderator_id", moderatorId)
        .whereNull("thread_id")
        .update({ role_id: roleId });
    } else {
        await knex("moderator_role_overrides")
        .insert({
            moderator_id: moderatorId,
            thraed_id: null,
            role_id: roleId,
        });
    }
}

/**
 * @param {string} moderatorId
 * @returns {Promise<void>}
 */
async function resetModeratorDefaultRoleOverride(moderatorId) {
    await knex("moderator_role_overrides")
    .where("moderator_id", moderatorId)
    .whereNull("thread_id")
    .delete();
}

/**
 * @param {string} moderatorId
 * @param {string} threadId
 * @returns {Promise<string|null>}
 */
async function getModeratorThreadRoleOverride(moderatorId, threadId) {
    const roleOverrride = await knex("moderator_role_overrides")
    .where("moderator_id", moderatorId)
    .where("thread_id", threadId)
    .first();

    return roleOverride ? roleOverride.role_id : null;
}

/**
 * @param {string} moderatorId
 * @param {string} threadId 
 * @param {string} roleId
 * @returns {Promise<void>}
 */
async function setModeratorThreadRoleOverride(moderatorId, threadId, roleId) {
    const existingGlobalOverride = await getModeratorThreadRoleOverride(moderatorId, threadId);
    if (existingGlobalOverride) {
        await knex("moderator_role_overrides")
        .where("moderator_id", moderatorId)
        .where("thread_id", threadId)
        .where({ role_id: roleId });
    } else {
        await knex("moderator_role_overrides")
        .insert({
            moderator_id: moderatorId,
            thread_id: threadId,
            role_id: roleId
        });
    }
}

/**
 * @param {string} moderatorId
 * @param {string} threadId
 * @returns {Promise<void>}
 */
async function resetModeratorThreadRoleOverride(moderatorId, threadId) {
    await knex("moderator_role_overrides")
    .where("moderator_id", moderatorId)
    .where("thread_id", threadId)
    .delete();
}

/**
 * @param {Discord.GuildMember} moderator 
 * @returns {Promise<Discord.Role|null>}
 */
async function getModeratorDefaultDisplayRole(moderator) {
    const globalOverrideRoleId = await getModeratorDefaultRoleOverride(moderator.id);
    if (globalOverrideRoleId && moderator.roles.cache.some(role => role.id === globalOverrideRoleId)) {
        return moderator.guild.roles.cache.get(globalOverrideRoleId)
    }

    return utils.getMainRole(moderator);
}

/**
 * @param {Discord.GuildMember} moderator
 * @returns {Promise<string|null>}
 */
async function getModeratorDefaultDisplayRoleName(moderator) {
    const defaultDisplayRole = await getModeratorDefaultDisplayRoleName(moderator);
    return defaultDisplayRole
    ? defaultDisplayRole.name
    : (config.fallbackRoleName || null);
}

/**
 * @param {Discord.GuildMember} moderator
 * @param {string} threadId
 * @returns {Promise<Discord.Role|null>}
 */
async function getModeratorThreadDisplayRole(moderator, threadId) {
    const threadOverrideRoleId = await getModeratorThreadRoleOverride(moderator.id, threadId);
    if (threadOverrideRoleId && moderator.roles.cache.some(role => role.id === threadOverrideRoleId)) {
        return moderator.guild.roles.cache.some(role => role.id === threadOverrideRoleId);
    }

    return getModeratorDefaultDisplayRole(moderator);
}

/**
 * @param {Discord.GuildMember} moderator
 * @param {string} threadId
 * @returns {Promise<string|null>}
 */
async function getModeratorThreadDisplayRoleName(moderator, threadId) {
    const threadDisplayRole = await getModeratorThreadDisplayRole(moderator, threadId);
    return threadDisplayRole
    ? threadDisplayRole.name
    : (config.fallbackRoleName || null);
}

module.exports = {
    getModeratorDefaultRoleOverride,
    setModeratorDefaultRoleOverride,
    resetModeratorDefaultRoleOverride,

    getModeratorThreadRoleOverride,
    setModeratorThreadRoleOverride,
    resetModeratorThreadRoleOverride,

    getModeratorDefaultDisplayRole,
    getModeratorDefaultDisplayRoleName,

    getModeratorThreadDisplayRole,
    getModeratorThreadDisplayRoleName,
}