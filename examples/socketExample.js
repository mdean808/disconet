const k = require('potash');
const node = new k();

node.on('ready', async () => {
    let proxy = node.genCircuit(2, '414a61c8cc5240791fa05e0657e8ca0904f3faf5cd56ab24c29c0bafbb3e572b');

    let server = k.createServer((socket) => {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });
    
    server.listen(1337, proxy);

    let client = new k.Socket(proxy);
    client.connect(1337, '04bcaaf03b87836c2094b8b844dba8e93bbef93f4534997f.k', () => {
        console.log('Connected');
        client.write('Hello, server! Love, Client.');
    });
});

node.listen()


