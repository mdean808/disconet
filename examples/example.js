const Disco = require('../src/main.js') // change to potash for release
const net = require('net');

const acceptedProtocols = ['tcp']

const node = new Disco(acceptedProtocols, acceptedProtocols);
const PORT = 1337;

node.on('ready', async () => {
    console.log('ready from example')


    //BROKEN???
    // generate a circuit with a minmum size of 2, default max size, and target -- make this return an addres
    let proxy = await node.genCircuit(2, null, '414a61c8cc5240791fa05e0657e8ca0904f3faf5cd56ab24c29c0bafbb3e572b');

    Disco.hostDiscoParty(proxy, (connection) => {
        /*console.log('ay someone connected')
        socket.write('Echo server\r\n');
        socket.pipe(socket);
        
        using express w/ fin.js

        let expressPort = 25565;
        let localSocket = new net.Socket();

        localSocket.connect(expressPort, '127.0.0.1', () => {
            console.log("Connected!");
            socket.write('ready'); //indicates to the client to start sending data

            socket.pipe(localSocket);
            localSocket.pipe(socket);
        });

        */
    }, 8080);

    //Disco.hostDiscoParty(25565); // "eofijaeofijaeiofj.disco"
    // Create an express server here
    //Discord.hostDiscoParty(app.listen(25565));
    //     ^ heck
    
    console.log("hostname", proxy.hostname); // should b 04bcaaf03b87836c2094b8b844dba8e93bbef93f4534997f

    let client = new Disco.Socket(proxy);
    client.connect(PORT, '04bcaaf03b87836c2094b8b844dba8e93bbef93f4534997f.k', () => {
        console.log('Connected');
        client.write('Hello, server!\n\nLove, Client.');
    });
});


// listen at port 1337
node.listen(PORT)