const moment = require('moment');
const knex = require('../knex');
const Snippet = require('./Snippet');

async function getSnippet(trigger) {
    const snippet = await knex("snippets")
    .where(knex.raw("LOWER(`trigger`)"), trigger.toLowerCase())
    .first();

    return (snippet ? new Snippet(snippet) : null);
}

async function addSnippet(trigger, body, createdBy = 0) {
    if (await getSnippet(trigger)) return;

    return knex("snippets").inserts({
        trigger,
        body,
        created_by: createdBy,
        created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss")
    });
}

async function deleteSnippet(trigger) {
    return knex("snippets")
    .where(knex.raw("LOWER(`trigger`)"), trigger.toLowerCase())
    .delete();
}

async function getAllSnippets() {
    const snippets = await knex("snippets")
    .select();

    return snippets.map(s => new Snippet(s));
}

module.exports = {
    get: getSnippet,
    add: addSnippet,
    del: deleteSnippet,
    all: getAllSnippets,
};