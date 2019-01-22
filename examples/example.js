const k = require('../src2/main.js') // change to potash for release
const node = new k();
const PORT = 1337

node.on('ready', async () => {
    // hardcoded private key
    let proxy = node.genCircuit(2, '414a61c8cc5240791fa05e0657e8ca0904f3faf5cd56ab24c29c0bafbb3e572b');

    let server = k.createServer((socket) => {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });
    
    server.listen(PORT, proxy);

    console.log(proxy.hostname); // should b 04bcaaf03b87836c2094b8b844dba8e93bbef93f4534997f

    let client = new k.Socket(proxy);
    client.connect(PORT, '04bcaaf03b87836c2094b8b844dba8e93bbef93f4534997f.k', () => {
        console.log('Connected');
        client.write('Hello, server!\n\nLove, Client.');
    });
});


