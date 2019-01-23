class Circuit {
    constructor(node, hops) {
        this.node = node;
        this.hops = hops;
    }

    append(circuit) {
        return new Circuit(this.node, (circuit == null) ? this.hops : this.hops.concat(circuit.hops));
    }
}

module.exports = Circuit;