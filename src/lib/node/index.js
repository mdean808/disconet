const Pool = require('../pool');
const EventEmitter = require('events');
const Routers = require('../../routers');
const http = require('../../routers/http');
const onion = require('../../routers/onion');
const p2p = require('../../routers/p2p');

// special port is 9410 
class Node extends EventEmitter {
    constructor(name, { port = 8610 }) {
        super();
        this.name = name;
        this.pool = new Pool(name);
        this.routers = new Routers(this);
        
        this.routers.use('http', new http({ node: this, port: port }));
        this.routers.use('onion', new onion({ node: this }));
        this.routers.use('p2p', new p2p({ node: this }));

        this.nonces = {};
    }
    
    async listen() {
        let vals = Object.values(this.routers.routers);
        for(let i = 0; i < vals.length; i++) {
            await vals[i].listen();
        }

        this.emit('ready');
    }

    fetchPeers() {

    }

    receive(req, res) {
        this.emit('message', req, res);
    }
}
module.exports = Node;