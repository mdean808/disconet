const EventEmitter = require('events');
const ec = new (require('elliptic').ec)('secp256k1');

const tcpRouter = require('./routers/tcp.js');
const wsRouter = require('./routers/ws.js');

const url = require('url');
const net = require('net');

class Node extends EventEmitter {
    constructor(accepts = ['ws', 'tcp'], outgoing = ['ws', 'tcp']) {
        this.routers = [];

        this.routers.push(new tcpRouter());
        this.routers.push(new wsRouter());

        this.accepts = accepts;
        this.outgoing = outgoing;
        this.peers = [];

        this.key = ec.genKeyPair();

        this.on('connection', (socket) => {
            
        });
    }

    genCircuit(minSize = 0, maxSize = 8, target = null, includeTarget = false) {
        let targetPeer = targetPeer == null ? this.peers[parseInt(Math.random() * this.peers.length)]
            : (targetPeer instanceof Peer ? targetPeer : this.lookup(targetPeer));

        let peers = [];
        peers.push(target);
        
        function isCompatible(a, b) {
            return a.find((c) => a.indexOf(c) != -1);
        }

        while(!isCompatible(this.outgoing, peer[0].accepts)) {
            let randPeer = this.peers[parseInt(Math.random() * this.peers.length)];
            peers.unshift(randPeer);
            
            if(peers.length > maxSize) {
                throw new Error("Could not create a circuit within specified limits");
            }

            // TODO: implement some kinda pathfinder that obeys da limits brada
        }

        return new Circuit(this, peers);
    }

    lookup(hostname) {
        return this.peers.find((peer) => {
            return peer.hostname == hostname || peer.publicKey == hostname;
        }) || new HTTPeer(url.parse(hostname));
    }

    router(protocol) {
        return this.routers.find((r) => r.name.toLowerCase() == protocol.toLowerCase());
    }

    createConnection(options, length, connectListener) {
        let proxy = null;
        if(typeof(options.circuitSize) == 'number')
            proxy = this.genCircuit(options.circuitSize);
        else if(typeof(options.circuit) != 'undefined')
            proxy = options.circuit;
        else if(typeof(length) == 'number')
            proxy = this.genCircuit(length);

        let client = new k.Socket({ circuit: proxy });
        connectListener = (typeof length == 'function' ? length : connectListener);

        if(typeof(options) == 'string') {
            client.connect(options, connectListener);
        } else if(typeof(options) == 'number') {
            client.connect(options, length, connectListener);
        } else {
            client.connect(options.port, options.host, connectListener);
        }
    }

    listen(port) {
        this.accepts.forEach((protocol) => {
            this.routers.find((r) => r.name == protocol).listen(port, this);
        });

        this.emit('ready');
    }
}

Node.Socket = class CircuitSocket extends net.Socket {
    constructor(options) {
        super(options);

        this.node = options.circuit instanceof Circuit ? options.circuit.node : null; 
        this.circuit = options.circuit instanceof Circuit ? options.circuit : null;
    }

    connect(options, connectListener) {
        if(this.node == null) {
            throw new Error("Socket not connected to a node!");
        }

        let path = options.path;
        
        let router = options.router || '?';
        let port = options.port;
        let host = options.host;

        if(typeof(path) != 'string') {
            path = options.router + '://' + options.host + ':' + options.host;
        }

        let url = url.parse(path);
        if(this.router.sends.length == 0) {
            throw new Error("Node not configured to allow outgoing requests!");
        }

        let peer = this.node.lookup(path.hostname);
        if(peer == null) {
            router == this.node.sends.indexOf('tcp') == -1 ? router : 'tcp';
            this.node.router(router).connect(url, this, this.circuit);
            return this;
        }

        if(peer != null && peer.accepts.length == 0) {
            throw new Error("Remote host configured to deny incoming requests");
        }
        
        //finish this
    }
}

module.exports = Node;