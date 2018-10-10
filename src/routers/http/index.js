const express = require('express');
const request = require('request')
const bodyParser = require('body-parser');
const os = require('os');
const binary = require('../../lib/utils/binary.js');

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
            },
            body: {
                content: msg
            },
            json: true
        }
        this.nonces[nonce] = resolve;
        request.post(reqOptions).on('response', (res) => {
            res.setEncoding('binary');
            res.on('data', (data) => {
                let payload = binary.deserialize(data);
                if(payload.type == 'end') {
                    this.nonces[nonce](payload.body);
                } else if(payload.type == 'reply') {
                    const nodeReq = {
                        body: payload.body,
                        nonce: payload.nonce,
                        router: this,
                        reply: (msg) => {
                            let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                            res.write(binary.serialize({
                                nonce: id,
                                body: msg
                            }));
                            return new Promise((resolveReply, rejectReply) => {
                                this.nonces[id] = resolveReply;
                            });                        
                        },
                        end: (msg) => {
                            res.end(msg);
                        }
                    };

                    this.nonces[nonce](nodeReq);
                }
            });
        });
    }
    getPeers() {

    }
    listen() {
        return new Promise((res, rej) => {
            this.app.use(bodyParser.json())
            this.app.listen(this.port, res);
            this.app.post('/receive', (req, res) => {
                res.writeHead(200, {
                    'Content-Type': 'text/plain',
                    'Transfer-Encoding': 'chunked'
                });

                const nodeReq = {
                    body: req.body.content,
                    nonce: req.get('nonce'),
                    router: this,
                    reply: (msg) => {
                        let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                        res.write(binary.serialize({
                            nonce: id,
                            body: msg
                        }));
                        return new Promise((resolve, reject) => {
                            this.nonces[id] = resolve;
                        });                        
                    },
                    end: (msg) => {
                        res.end(msg);
                    }
                };
                this.node.receive(nodeReq);
            });
        });
    }
}

module.exports = http;