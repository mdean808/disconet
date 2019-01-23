const crypto = require('crypto');

class Pool {
    constructor(name) {
        this.id = crypto.createHash('sha256').update(name, 'utf8').digest();
    }
}


module.exports = Pool;