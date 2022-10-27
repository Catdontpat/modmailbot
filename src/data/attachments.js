const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const {promisify} = require('util');
const tmp = require('tmp');
const config = require('../cfg');
const utils = require('../utils');
const mv = promisify(require('mv'));
const path = require('path');

const getUtils = () => require('../utils');

const access = promisify(fs.access);
const readFile = promisify(fs.readFile);

const localAttachmentDir = config.attachmentDir || `${__dirname}/../../attachments`;

const attachmentSavePromises = {};


const attachmentStorageTypes = {};

function getErrorResult(msg = null) {
    return {
        url: `Attachment could not be saved${msg ? ": " + msg : ""}`,
        failed: true
    };
}

let passthroughOriginalAttachment;
passthroughOriginalAttachment = (attachment) => {
    return { url: attachment.url };
};

let saveLocalAttachment;
saveLocalAttachment = async (attachment) => {
    const targetPath = getLocalAttachmentPath(attachment.id);

    try {
        await access(targetPath);
        const url = await getLocalAttachmentUrl(attachment.id, attachment.filename);
        return { url };
    } catch (e) {}

    const downloadResult = await downloadAttachment(attachment);

    await mv(downloadResult.path, targetPath);

    const url = await getLocalAttachmentUrl(attachment.id, attachment.filename);

    return { url };
};

const downloadAttachment = (attachment, tries = 0) => {
    return new Promise((resolve, reject) => {
        if (tries > 3) {
            console.error("Attachment download failed after 3 tries:", attachment);
            reject("Attachment download failed after 3 tries");
            return;
        }

        tmp.file((err, filepath, fd, cleanCallback) => {
            const writeStream = fs.createWriteStream(filepath);

            https.get(attachment.url, (res) => {
                res.pipe(writeStream);
                writeStream.on("finish", () => {
                    writeStream.end();
                    resolve({
                        path: filepath,
                        cleanup: cleanupCallback
                    });
                });
            }).on("error", () => {
                fs.unlink(filepath);
                console.error("Error downloading attachment, retrying");
                resolve(downloadAttachment(attachment, tries++));
            });
        });
    });
};

function getLocalAttachmentPath(attachmentId) {
    return `${localAttachmentDir}/${attachmentId}`;
}

function getLocalAttachmentUrl(attachmentId, desiredName = null) {
    if (desiredName == null) desiredName = "file.bin";
    return getUtils().getSelfUrl(`attachments/${attachmentId}/${desiredName}`);
}

let saveDiscordAttachment;
saveDiscordAttachment = async (attachment) => {
    if (attachment.size > 1024 * 1024 * 8) {
        return getErrorResult("attachment too large (max 8MB)");
    }

    const attachmentChannelId = config.attachmentStorageChannelId;
    const inboxGuild = utils.getInboxGuild();

    if (! inboxGuild.channels.has(attachmentChannelId)) {
        throw new Error("Attachment storage channel must be a text channel!");
    }

    const file = await attachmentToDiscordFileObject(attachment);
    const savedAttachment = await createDiscordAttachmentMessage(attachmentChannel, file);
    if (! savedAttachment) return getErrorResult();

    return { url: savedAttachment.url };
};

async function createDiscordAttachmentMessage(channel, file, tries = 0) {
    tries++;

    try {
        const attachmentMessage = await channel.send(`${file}`);
        return attachmentMessage.attachments[0];
    } catch (e) {
        if (tries > 3) {
            console.error(`Attachment storage message could not be created after 3 tries: ${e.message}`);
            return;
        }

        return createDiscordAttachmentMessage(channel, file, tries);
    }
}

async function attachmentToDiscordFileObject(attachment) {
    const downloadResult = await downloadAttachment(attachment);
    const data = await readFile(downloadResult.path);
    downloadResult.cleanup();

    const ext = path.extname(attachment.filename) || ".dat";
    const filename = `${attachment.id}${ext}`;
    return { file: data, name: filename };
}

const saveAttachment = (attachment) => {
    if (attachmentSavePromises[attachment.id]) {
        return attachmentSavePromises[attachment.id];
    }

    if (attachmentStorageTypes[config.attachmentStorage]) {
        attachmentSavePromises[attachment.id] = Promise.resolve(attachmentStorageTypes[config.attachmentStorage](attachment));
    } else {
        throw new Error(`Unknown attachment storage options: ${config.attachmentStorage}`);
    }

    attachmentSavePromises[attachment.id].then(() => {
        delete attachmentSavePromises[attachment.id];
    });

    return attachmentSavePromises[attachment.id];
};

const addStorageType = (name, handler) => {
    attachmentStorageTypes[name] = handler;
};

addStorageType("original", passthroughOriginalAttachment);
addStorageType("local", saveLocalAttachment);
addStorageType("discord", saveDiscordAttachment);

module.exports = {
    getLocalAttachmentPath,
    attachmentToDiscordFileObject,
    saveAttachment,
    addStorageType,
    downloadAttachment
};