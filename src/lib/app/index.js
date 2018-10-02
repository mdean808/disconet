export class App {
    constructor(name, { keypair, version = 0 }) {
        this.methods = {};
        this.keypair = keypair;
        this.version = version;
        this.name = name;
    }
}