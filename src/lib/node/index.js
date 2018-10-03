const Pool = require('../pool');
const EventEmitter = require('events');

 class Node extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.pool = new Pool(name);
    }
    
}
module.exports = Node;