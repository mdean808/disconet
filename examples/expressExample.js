const k = require('../src2/main.js') // change to potash for release
const express = require('express');
const node = new k();

let app = express();

node.on('ready', async () => {
    let proxy = node.genCircuit(2, '414a61c8cc5240791fa05e0657e8ca0904f3faf5cd56ab24c29c0bafbb3e572b');

    app.get('/', (req, res) => res.send('Hello World!'));

    let server = k.createServer(app);
    server.listen(1337, proxy);
});


