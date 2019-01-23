class Peer {
    constructor(hostname, publicKey, accepts, outgoing) {
        this.hostname = hostname;
        this.publicKey = publicKey;
        this.accepts = accepts;
        this.outgoing = outgoing;
    }

    encrypt(buffer) {
        //return publicKey == null ? buffer : //publicKey.encrypt(buffer); TODO: **implement**
    }
}

class HTTPeer extends Peer {
    constructor(url) {
        super(url.hostname, null, url.protocol == null ? ['tcp'] : [url.protocol], []);
    }
}


module.exports = { Peer, HTTPeer };