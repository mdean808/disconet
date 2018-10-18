const Router = require('../../routers')
class Peer {
    constructor ({node, address, publicKey = null}) {
        this.node = node;
        this.address = address;
        this.publicKey = publicKey;
    }

    send(msg) {
        if (!msg)
            throw new Error("No message found.")
        if (!this.address)
            throw new Error("No address found.")
        return new Promise((res, rej) => {
            splitAddress(this.node, this.address).router.send(msg, this.address, res, this); // send message using specified router mode to address
        });
    }

    push(msg) {
        if (!msg)
            throw new Error("No message found.")
        if (!this.address)
            throw new Error("No address found.")
        splitAddress(this.node, this.address).router.push(msg, this.address, this); // send message using specified router mode to address
    }

    requestPeers() {
        return this.send({
            _packet__: 'get_peers'
        })
    }
}

module.exports = Peer;

function splitAddress(node, addr) {
    const splitAddr = addr.split('/');
    if (splitAddr.length > 2 || splitAddr < 2) {
        throw new Error("Incorrect address specified.")
    }
    const router = addr.split('/')[0]
    //console.log('Router:', router);
    const path = addr.split('/')[1]
    return {
        router: node.routers.get(router),
        path: path
    }
}