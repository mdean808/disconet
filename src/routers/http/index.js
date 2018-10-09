const express = require('express');
const request = require('request')
var bodyParser = require('body-parser')

class http {
    constructor({
        port,
        node,
        nonces
    }) {
        this.app = express();
    
        this.port = port
        this.node = node
        this.nonces = {};
    }
    send(msg, address, resolve) {
        const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const reqOptions = {
            url: 'http://' + address.split('/').splice(1).join('/') + '/receive',
            headers: {
                'nonce': nonce,
                'sender': this.getAddress()
            },
            body: { content: msg },
            json: true
        }
        this.nonces[nonce] = resolve;
        request.post(reqOptions);
    }
    getPeers() {

    }
    getAddress() {
        return 'http/127.0.0.1:8081'; //TODO: make sure this gets dynamic for releases
    }
    listen() {
        return new Promise((res, rej) => {
            this.app.use(bodyParser.json())
            this.app.listen(this.port, res);
            this.app.post('/receive', (req, res) => {
                const nodeReq = {
                    body: req.body.content,
                    peer: req.get('sender'),
                    nonce: req.get('nonce'),
                    router: this
                }
                const nodeRes = {
                    reply: (msg) => {
                        return this.reply(nodeReq.nonce, msg, nodeReq.peer);
                    },
                    end: (msg) => {
                        return this.end(nodeReq.nonce, msg, nodeReq.peer);
                    }
                };
                this.node.receive(nodeReq, nodeRes)
                res.end();
            });
            this.app.post('/end', (req, res) => {
                const nodeReq = {
                    body: req.body,
                    peer: req.get('sender'),
                    nonce: req.get('nonce'),
                    router: this
                }
                let nodeRes = this.nonces[nodeReq.nonce];
                if(nodeRes) {
                    nodeRes(req.body);
                }
                res.end();
            });
            this.app.post('/reply', (req, res) => {
                const nodeReq = {
                    body: req.body,
                    peer: req.get('sender'),
                    nonce: req.get('nonce'),
                    router: this
                }
                const nodeRes = {
                    reply: (msg) => {
                        return this.reply(nodeReq.nonce, msg, nodeReq.peer);
                    },
                    end: (msg) => {
                        return this.end(nodeReq.nonce, msg, nodeReq.peer);
                    }
                };
                let callback = this.nonces[nodeReq.nonce];
                if(callback) {
                    callback({ req: nodeReq, res: nodeRes });
                }
                res.end();
            });
        });
    }

    reply(nonce, msg, address) {
        const reqOptions = {
            url: 'http://' + address.split('/').splice(1).join('/') + '/reply',
            headers: {
                'Nonce': nonce,
                'Sender': this.getAddress()
            },
            body: msg
        }
        request.post(reqOptions, msg);

        return new Promise((res, rej) => {
            this.nonces[nonce] = res;
        });
    }

    end(nonce, msg, address) {
        const reqOptions = {
            url: 'http://' + address.split('/').splice(1).join('/') + '/end',
            headers: {
                'Nonce': nonce,
                'Sender': this.getAddress()
            },
            body: msg
        }
        request.post(reqOptions);
    }
}

module.exports = http;