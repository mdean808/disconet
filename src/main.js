const EventEmitter = require('events');
const ec = new(require('elliptic').ec)('secp256k1');

const tcpRouter = require('./routers/tcp.js');
const wsRouter = require('./routers/ws.js');
const Circuit = require('./circuit.js')

const { Peer, HTTPeer } = require('./peer.js');

const net = require('net');
const URL = require('url');

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
        }) || new HTTPeer(URL.parse(hostname));
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

    static async hostDiscoParty(circuit, cb, remotePort) {
        let serverId = await newDiscoKey();

        if (typeof(cb) == 'function') {
            /* 
            hostDiscoParty((socket) => {
                console.log("New connection by " + socket.id);

                socket.on('data', (data) => {
                    console.log(socket.id + " said " + data.toString())
                });
            });
            */
            circuit.node.on('serverConnection', (id, socket) => {
                if (id == serverId) {
                    cb(socket);
                }
            });
        } else if (Number.isInteger(cb)) {
            /* 
            
            //the user has already created example third party tcp/ip server with the passed ports
            
            // can be any server on any port (not necessarily a node server)
            var exec = require('child_process').exec;
            //start minecraft server using eth jar on the preset port 25565
            exec('java -jar minecraft_server.jar -Xmx1G -Xms1G nogui', function (error, stdOut, stdErr) {
                    // do what u want with da server BRAH!
                });


            //generate peer to peer .disco address for your server ( so you don't need to port forward, or so you can be anonymous )
            histDiscoParty(25565);

            */

            // Port passed into function
            console.log("NEW PORT: ", cb)         
            circuit.node.on('serverConnection', (id, socket) => {
                if (id == serverId) {
                    let client = net.createConnection({ port: cb });
                    pipeSockets(remote, local); //cb(socket);
                }
            });
        } else if(cb instanceof net.Server) {
            /* 
            // the user has already created an express server and passed it
            // step 1: create express server
            const express = require('express')
            const app = express()
            const port = 3000

            app.get('/', (req, res) => res.send('Hello World!'))

            // step 2: get net.Server object called server
            let server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

            // step 3: make .disco address by passing server
            hostDiscoParty(server);
            
            */

            circuit.node.on('serverConnection', (id, socket) => {
                if (id == serverId) {
                    let client = net.createConnection({ port: cb });
                    cb.emit('connection', client);
                }
            });
// Express server passed into function
        } else {
            throw new Error("Invalid argument passed into function");
        }

        //return serverId + ".disco";
    }
}

function pipeSockets(remote, local) { // warning: will probably explode
    remote.pipe(local);
    local.pipe(remote);
}

Node.Socket = class CircuitSocket extends net.Socket {
    constructor(options) {
        super(options);

        this.node = options instanceof Circuit ? options.node : options.circuit.node; // : null;
        this.circuit = options.circuit instanceof Circuit ? options : options.circuit; // : null;
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

        let url = URL.parse(path);
        if (this.node.outgoing.length == 0) {
            throw new Error("Node not configured to allow outgoing requests!");
        }

        let peer = this.node.lookup(url.hostname);
        if (peer == null) {
            router == this.node.outgoing.indexOf('tcp') == -1 ? router : 'tcp';
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

function newDiscoKey() {
    var crypto = require("crypto");
    return new Promise(function (res, rej) {                                
        crypto.randomBytes(48, (err, buffer) => {
            if(err) rej(err);
            let serverId = buffer.toString('hex');
            res(serverId)
        });
    })
}