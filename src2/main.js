const EventEmitter = require('events');
const ec = new (require('elliptic').ec)('secp256k1');

const tcpRouter = require('./routers/tcp.js');
const wsRouter = require('./routers/ws.js');

class Node extends EventEmitter {
    constructor(accepts = ['ws', 'tcp'], sends = ['ws', 'tcp']) {
        this.routers = [];

        this.routers.push(new tcpRouter());
        this.routers.push(new wsRouter());

        this.accepts = accepts;
        this.sends = sends;
        this.peers = [];

        this.key = ec.genKeyPair();
    }

    genCircuit(size) {

    }

    listen(port) {
        this.accepts.forEach((protocol) => {
            this.routers.find((r) => r.name == protocol).listen(port);
        });

        this.emit('ready');
    }
}

module.exports = Node;