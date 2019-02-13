const { Peer } = require('./peer.js');
const ec = new(require('elliptic').ec)('secp256k1');

class Circuit {
    // hops is an array of random nodes
    constructor(node, hops) {
        this.node = node;
        this.hops = hops;
    }

    append(circuit) {
        return new Circuit(this.node, (circuit == null) ? this.hops : this.hops.concat(circuit.hops));
    }

    generate(minSize = 0, maxSize = 8, target = null, includeTarget = false) {
        let targetPeer = target == null ? this.peers[parseInt(Math.random() * this.peers.length)]
            : (target instanceof Peer ? target : this.lookup(target));

        let hops = [];
        hops.push(target);
        
        function isCompatible(a, b) {
            return a.find((c) => a.indexOf(c) != -1);
        }

        while(!isCompatible(this.node.outgoing, hops[0].accepts)) {
            let randPeer = this.node.peers[parseInt(Math.random() * this.node.peers.length)];
            hops.unshift(randPeer);
            
            if(hops.length > maxSize) {
                throw new Error("Could not create a circuit within specified limits");
            }

            // TODO: implement some kinda pathfinder that obeys da limits brada
        }
        
        this.hops = hops;
    }

    lookup(target) {
        return this.node.lookup(target);
    }

    get hostname() {
        return Buffer.from(this.node.key.getPublic().toString()).toString('hex'); // should get the public key as hex ( or as a buffer then convert it to a string using .toString('hex')) 
    }
}

module.exports = Circuit;