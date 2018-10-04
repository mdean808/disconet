const express = require('express');
const request = require('request')

class http {
    constructor({
        port,
        node,
        nonces
    }) {
        this.app = express();
        this.port = port
        this.node = node
    }
    send(msg, address, resolve) {
        const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const reqOptions = {
            url: address + '/receive',
            headers: {
                'Nonce': nonce,
                'Sender': this.getAddress()
            },
            body: msg
        }
        this.nonces[nonce] = resolve;
        request.post(reqOptions);
    }
    getPeers() {

    }
    getAddress() {
        return this.routerId + '/';
    }
    listen() {
        this.app.listen(this.port);
        this.app.post('/receive', (req, res) => {
            const nodeReq = {
                body: req.body,
                peer: req.headers.Sender,
                nonce: req.headers.Nonce,
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
                .then(res.status(200))
                .err(res.status(500));
        });
        this.app.post('/end', (req, res) => {
            const nodeReq = {
                body: req.body,
                peer: req.headers.Sender,
                nonce: req.headers.Nonce,
                router: this
            }
            let nodeRes = this.nonces[nodeReq.nonce];
            if(nodeRes) {
                nodeRes(req.body);
            }
        });
        this.app.post('/reply', (req, res) => {
            const nodeReq = {
                body: req.body,
                peer: req.headers.Sender,
                nonce: req.headers.Nonce,
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
        });
    }

    reply(nonce, msg, address) {
        const reqOptions = {
            url: address + '/reply',
            headers: {
                'Nonce': nonce,
                'Sender': this.getAddress()
            },
            body: msg
        }
        request.post(reqOptions, msg);
    }

    end(nonce, msg, address) {
        const reqOptions = {
            url: address + '/end',
            headers: {
                'Nonce': nonce,
                'Sender': this.getAddress()
            },
            body: msg
        }
        request.post(reqOptions);
    }
}