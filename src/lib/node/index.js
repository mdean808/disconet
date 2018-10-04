const Pool = require('../pool');
const EventEmitter = require('events');
const Routers = require('..../routers');
// special port is 9410 
 class Node extends EventEmitter {
    constructor(name, { port = 10 }) {
        super();
        this.name = name;
        this.pool = new Pool(name);
        this.routers = new Routers(this);

        this.routers.use('http', new require('./http')({ node: this, port: port }));
        this.routers.use('onion', new require('./onion')({ node: this }));
        this.routers.use('p2p', new require('./p2p')({ node: this }));

        this.nonces = {};
    }
    
    listen() {

    }

    fetchPeers() {

    }

    receive(req, res) {
        this.emit('message', req, res);
    }
}
module.exports = Node;