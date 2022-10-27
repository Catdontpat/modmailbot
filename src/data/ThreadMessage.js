const knex = require('../knex');
const utils = require('../utils');
const { THREAD_MESSAGE_TYPE } = require('./constants');

class ThreadMessage {
    constructor(props) {
        utils.setDataModelProps(this, props);

        if (props.attachments) {
            if (typeof props.attachments === "string") {
                this.attachments = JSON.parse(props.attachments);
            }
        } else {
            this.attachments = [];
        }

        if (props.small_attachments) {
            if (typeof props.small_attachments === "string") {
                this.small_attachments = JSON.parse(props.small_attachments);
            }
        } else {
            this.small_attachments = [];
        }

        if (props.metadata) {
            if (typeof props.metadata === "string") {
                this.metadata = JSON.parse(props.metadata);
            }
        }
    }

    getSQLProps() {
        return Object.entries(this).reduce((obj, [key, value]) => {
            if (typeof value === "function") return obj;
            if (typeof value === "object" && value != null) {
                obj[key] = JSON.stringify(value);
            } else {
                obj[key] = value;
            }
            return obj;
        }, {});
    }

    async setMetadataValue(key, value) {
        this.metadata = this.metadata || {};
        this.metadata[key] = value;

        if (this.id) {
            await knex("thread_messages")
            .where("id", this.id)
            .update({
                metadata: this.getSQLProps().metadata,
            });
        }
    }

    getMetadataValue(key) {
        return this.metadata ? this.metadata[key] : null;
    }

    ifFromUser() {
        return this.message_type === THREAD_MESSAGE_TYPE.FROM_USER;
    }

    isChat() {
        return this.message_type === THREAD_MESSAGE_TYPE.CHAT;
    }

    clone() {
        return new ThreadMessage(this.getSQLProps());
    }
}

module.exports = ThreadMessage;