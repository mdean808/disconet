const Pool = require('./pool');

export class Node {
    constructor(name) {
        this.name = name;
        this.pool = new Pool(name);
    }
}