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
    sendRaw(data, address) {
        const ws = new WebSocket('ws://' + address.split('/').splice(1).join('/') + '/receive');
        ws.on('open', () => {
            ws.send(data);
        })
        ws.on('message', (data) => {
            let payload = binary.deserialize(data);
            if(payload.type == 'end') {
                this.nonces[payload.oldNonce](payload.body);
            } else if(payload.type == 'reply') {
                const nodeReq = {
                    body: payload.body,
                    nonce: payload.nonce,
                    router: this,
                    reply: (msg) => {
                        let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                        ws.send(binary.serialize({
                            oldNonce: payload.nonce,
                            nonce: id,
                            type: 'reply',
                            body: msg
                        }));
                        return new Promise((resolveReply, rejectReply) => {
                            this.nonces[id] = resolveReply;
                        });                        
                    },
                    end: (msg) => {
                        ws.send(binary.serialize({
                            oldNonce: payload.nonce,
                            type: 'end',
                            body: msg
                        }));                       
                    }
                };
                this.nonces[payload.oldNonce](nodeReq);
            }
        });
    }
    push(msg, address) {
        this.sendRaw(binary.serialize({
            type: 'end',
            body: msg
        }), address)
    }
    send(msg, address, resolve) {
        const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.nonces[nonce] = resolve;
        this.sendRaw(binary.serialize({
            type: 'send',
            nonce: nonce,
            body: msg
        }), address, resolve);
    }
    getPeers() {

    }
    listen() {
        return new Promise((res, rej) => {
            const wss = new WebSocket.Server({ port: this.port }, res);
            wss.on('connection', (ws) => {
                ws.on('message', (message) => {
                    message = binary.deserialize(message)
                    const nodeReq = {
                        body: message.body,
                        nonce: message.nonce,
                        router: this,
                        readOnly: false,
                        reply: (msg) => {
                            let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                            ws.send(binary.serialize({
                                oldNonce: message.nonce,
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
                            let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                            ws.send(binary.serialize({
                                oldNonce: message.nonce,
                                type: 'end',
                                body: msg
                            }));
                            ws.close();
                        }
                    };
                    if(message.type == 'send') {
                        this.node.receive(nodeReq);
                    } else if(message.type == 'reply') {
                        this.nonces[message.oldNonce](nodeReq);
                    } else if(message.type == 'end') {
                        if(message.oldNonce)
                            this.nonces[message.oldNonce](message.body);
                        else { //TODO: change this to if(message.type == 'sendOnce')
                            delete nodeReq.reply;
                            delete nodeReq.end;
                            nodeReq.readOnly = true;
                            this.node.receive(nodeReq);
                        }
                        ws.close();
                    }
                });  
            });
        });
    }
}

module.exports = ws;