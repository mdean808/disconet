const EventEmitter = require('events');
const ec = new(require('elliptic').ec)('secp256k1');

const tcpRouter = require('./routers/tcp.js');
const wsRouter = require('./routers/ws.js');

const url = require('url');
const net = require('net');

class Node extends EventEmitter {
    constructor(accepts = ['ws', 'tcp'], outgoing = ['ws', 'tcp']) {
        super()
        this.routers = [];

        this.routers.push(new tcpRouter());
        this.routers.push(new wsRouter());

        this.accepts = accepts;
        this.outgoing = outgoing;
        this.peers = [];

        this.key = ec.genKeyPair();

        // called after tcp/ws listen socket is connected
        this.on('connection', (socket) => {
            console.log("we had a connection")


            socket.on('data', (data) => {
                console.log("New data!", data)
                if (data.id === "SERVER") {
                    this.emit("serverConnection", data.serverId, socket);
                }
            })
            /* 

            var data = parseSocket(socket);

            if(data.id == "SERVER") {
                this.emit(data.serverId, socket);
            }

            */
        });

    }

    async genCircuit(minSize = 0, maxSize = 8, target = null, includeTarget = false) {

        let circuit = new Circuit(this, []);
        await circuit.generate(minSize, maxSize, target, includeTarget);
        return circuit
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
        if (typeof (options.circuitSize) == 'number')
            proxy = this.genCircuit(options.circuitSize);
        else if (typeof (options.circuit) != 'undefined')
            proxy = options.circuit;
        else if (typeof (length) == 'number')
            proxy = this.genCircuit(length);

        let client = new k.Socket({
            circuit: proxy
        });
        connectListener = (typeof length == 'function' ? length : connectListener);

        if (typeof (options) == 'string') {
            client.connect(options, connectListener);
        } else if (typeof (options) == 'number') {
            client.connect(options, length, connectListener);
        } else {
            client.connect(options.port, options.host, connectListener);
        }
    }

    listen(port) {
        // check which protocols are available

        //WARNING: this will need to chnage when multiple protocols are available. Both need to be listening before ready, not just one
        this.accepts.forEach((protocol) => {
            let curRouter = this.routers.find((r) => r.name == protocol)
            curRouter.on('ready', () => {
                this.emit('ready')
            });
            curRouter.listen(port, this);
        });
    }

    createServer(cb) {
        return new Promise((res, rej) => {
            require('crypto').randomBytes(48, (err, buffer) => {
                if(err) rej(err);
                let serverId = buffer.toString('hex');
    
                this.on('serverConnection', (id, socket) => {
                    if (id == serverId) {
                        cb(socket);
                    }
                });
            });
        });
    }
}

Node.Socket = class CircuitSocket extends net.Socket {
    constructor(options) {
        super(options);

        this.node = options.circuit instanceof Circuit ? options.circuit.node : null;
        this.circuit = options.circuit instanceof Circuit ? options.circuit : null;
    }

    connect(options, connectListener) {
        if (this.node == null) {
            throw new Error("Socket not connected to a node!");
        }

        let path = options.path;

        let router = options.router || '?';
        let port = options.port;
        let host = options.host;

        if (typeof (path) != 'string') {
            path = options.router + '://' + options.host + ':' + options.host;
        }

        let url = url.parse(path);
        if (this.router.sends.length == 0) {
            throw new Error("Node not configured to allow outgoing requests!");
        }

        let peer = this.node.lookup(path.hostname);
        if (peer == null) {
            router == this.node.sends.indexOf('tcp') == -1 ? router : 'tcp';
            this.node.router(router).connect(url, this, this.circuit);
            return this;
        }

        if (peer != null && peer.accepts.length == 0) {
            throw new Error("Remote host configured to deny incoming requests");
        }

        //finish this
    }
}

module.exports = Node;