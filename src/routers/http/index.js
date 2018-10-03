const express = require('express');
const request = require('request')

class http {
    constructor({port, node}) {
        this.app = express();
        this.port = port
        this.node = node
    }
    send(msg, address) {
        request.post(address, msg);
    }
    getPeers() {

    }
    listen() {
        this.app.listen(this.port);
        this.app.post('/receive', (req, res) => {
            this.node.receive(req, res);
        });
    }
}