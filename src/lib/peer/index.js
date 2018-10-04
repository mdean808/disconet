const Router = require('../../routers')
class Peer {
    constructor ({node, address}) {
        this.node = node;
        this.address = address;
    }
    sendToPeer(msg) {
        if (!msg)
            throw new Error("No message found.")
        if (!this.address)
            throw new Error("No address found.")
        return new Promise((res, rej) => {
            splitAddress(this.node, this.address).router.send(msg, this.address, res); // send message using specified router mode to address
        });
    }
}

module.exports = Peer;

function splitAddress(node, addr) {
    const splitAddr = addr.split('/');
    if (splitAddr.length > 2 || splitAddr < 2) {
        throw new Error("Incorrect address specified.")
    }
    const router = addr.split('/')[0]
    const path = addr.split('/')[1]
    return {
        router: node.routers.get(router),
        path: path
    }
}