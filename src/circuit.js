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
            : (targetPeer instanceof Peer ? targetPeer : this.lookup(targetPeer));

        let hops = [];
        hops.push(target);
        
        function isCompatible(a, b) {
            return a.find((c) => a.indexOf(c) != -1);
        }

        while(!isCompatible(this.outgoing, hops[0].accepts)) {
            let randPeer = node.peers[parseInt(Math.random() * node.peers.length)];
            hops.unshift(randPeer);
            
            if(hops.length > maxSize) {
                throw new Error("Could not create a circuit within specified limits");
            }

            // TODO: implement some kinda pathfinder that obeys da limits brada
        }
        
        this.hops = hops;
    }
}

module.exports = Circuit;