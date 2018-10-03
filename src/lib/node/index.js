const Pool = require('../pool');

 class Node {
    constructor(name) {
        this.name = name;
        this.pool = new Pool(name);
    }
}
module.exports = Node;