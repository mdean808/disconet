const Pool = require('../pool');
const EventEmitter = require('events');
const Routers = require('../../routers');
const ws = require('../../routers/ws');
const onion = require('../../routers/onion');
const p2p = require('../../routers/p2p');
const EC = require('elliptic').ec;
 
const ec = new EC('secp256k1');
const dgram = require('dgram');

const PORT = 49410;
const MCAST_ADDR = '238.45.142.53';
        
let easterEgg = false;
// special port is 9410 
class Node extends EventEmitter {
    constructor(name, { port = 9410 }) {
        super();
        this.name = name;
        this.pool = new Pool(name);
        this.routers = new Routers(this);
        
        this.routers.use('ws', new ws({ node: this, port: port }));
        this.routers.use('onion', new onion({ node: this }));
        this.routers.use('p2p', new p2p({ node: this }));

        this.nonces = {};
        this.peers = [];                
                
        this.directKey = ec.genKeyPair();
        this.indirectKey = ec.genKeyPair();

        this.findLocalPeers();
    }
    
    async listen() {
        let vals = Object.values(this.routers.routers);
        for(let i = 0; i < vals.length; i++) {
            await vals[i].listen(); 
        }

        this.emit('ready');
    }

    findLocalPeers() {
        let socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        socket.bind(PORT, () => {
            socket.setBroadcast(true);
            socket.setMulticastTTL(128);
            socket.addMembership(MCAST_ADDR);
        });

        socket.on('listening', function () {
            var address = socket.address();
            console.log('UDP Client listening on ' + address.address + ":" + address.port);
            socket.setBroadcast(true)
            socket.setMulticastTTL(128); 
            socket.addMembership(MCAST_ADDR);
        });
        
        socket.on('message', function (message, remote) {   
            console.log('MCast Msg: From: ' + remote.address + ':' + remote.port +' - ' + message);
        });
        
        setInterval(() => {
            var message = new Buffer(news[Math.floor(Math.random()*news.length)]);
            server.send(message, 0, message.length, PORT,MCAST_ADDR);
            console.log("Sent " + message + " to the wire...");
        }, 3000);
    }

    fetchPeers() {

    }

    receive(req, res) {
        this.emit('message', req, res);
    }
    easter(name) {
        easterEgg = true;
        console.log(`Nice job, ${name}!`);
    }
}
module.exports = {Node, easterEgg};