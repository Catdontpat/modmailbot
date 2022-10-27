const utils = require('../utils');

class Note {
    constructor(props) {
        utils.setDataModelProps(this, props);
    }
}

module.exports = Note;