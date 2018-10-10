const express = require('express');
const WebSocket = require('ws')
const bodyParser = require('body-parser');
const os = require('os');
const binary = require('../../lib/utils/binary.js');

class ws {
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
        const ws = new WebSocket('ws://' + address.split('/').splice(1).join('/') + '/receive');
        this.nonces[nonce] = resolve;
        ws.on('open', () => {
            ws.send(binary.serialize({
                headers: {
                    'nonce': nonce,
                },
                body: {
                    content: msg
                }
            }));
        })
        ws.on('message', (data) => {
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
                        ws.send(binary.serialize({
                            nonce: id,
                            type: 'reply',
                            body: msg
                        }));
                        return new Promise((resolveReply, rejectReply) => {
                            this.nonces[id] = resolveReply;
                        });                        
                    },
                end: (msg) => {
                    //todo: correct way to close the websocket w/ a message????
                    res.end(binary.serialize({
                        type: 'end',
                        body: msg
                    }));
                }
            };
            this.nonces[nonce](nodeReq);
        }
        });
        // to be removed
        const reqOptions = {
            headers: {
                'nonce': nonce,
            },
            body: {
                content: msg
            },
            json: true,
        }
        request.post(reqOptions).on('response', (res) => {
            res.setEncoding('hex');
            res.on('data', (data) => {
                if (Buffer.from(data, 'hex').length > 5) {
                    let payload = binary.deserialize(Buffer.from(data, 'hex'));
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
                                    type: 'reply',
                                    body: msg
                                }));
                                return new Promise((resolveReply, rejectReply) => {
                                    this.nonces[id] = resolveReply;
                                });                        
                            },
                            end: (msg) => {
                                res.end(binary.serialize({
                                    type: 'end',
                                    body: msg
                               }));
                            }
                        };

                        this.nonces[nonce](nodeReq);
                    }
                }
            });
        });
    }
    getPeers() {

    }
    listen() {
        return new Promise((res, rej) => {
            const wss = new WebSocket.Server({ port: this.port });
            wss.on('connection', (ws) => {
                ws.on('message', (message) => {
                    let message = binary.deserialize(message)
                    const nodeReq = {
                        body: message.body,
                        nonce: message.nonce,
                        router: this,
                        reply: (msg) => {
                            let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                            ws.send(binary.serialize({
                                nonce: id,
                                type: 'reply',
                                body: msg
                            }));
                            return new Promise((resolve, reject) => {
                                this.nonces[id] = resolve;
                            });                 
                        },
                        end: (msg) => {
                            // somehow close ws
                            res.end(binary.serialize({
                                type: 'end',
                                body: msg
                           }));
                        }
                    };
                });  
            });
            //to be removed
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
                            type: 'reply',
                            body: msg
                        }));
                        return new Promise((resolve, reject) => {
                            this.nonces[id] = resolve;
                        });                        
                    },
                    end: (msg) => {
                        res.end(binary.serialize({
                            type: 'end',
                            body: msg
                       }));
                    }
                };
                this.node.receive(nodeReq);
            });
        });
    }
}

module.exports = ws;