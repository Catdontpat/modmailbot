const moment = require('moment');
const knex = require('../knex');
const Note = require('./Note');

async function findNodesByUserId(userID) {
    const rows = await knex("notes")
    .where("user_id", userID)
    .select();

    return rows.map(row => new Note(row));
}

async function findNote(id) {
    const row = await knex("notes")
    .where("id", id)
    .first();

    return row ? new Note(row) : null;
}

async function deleteNote(id) {
    await knex("notes")
    .where("id", id)
    .delete();
}


async function createUserNote(userID, authorID, body) {
    const createdRow = await knex("notes").insert({
        user_id: userID,
        author_id: authorID,
        body,
        created_at: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    });

    return new Note(createdRow);
}

module.exports = {
    findNodesByUserId,
    findNote,
    deleteNote,
    createUserNote
};