const { Node, Peer } = require('../src/main.js') // change to finjs for release
let exampleApp = new Node('example');

exampleApp.on('ready', async () => {
    console.log(await exampleApp.fetchPeers()); // should include self
    var bob = new Peer({address: 'ipv4/127.0.0.1'})
    let example1 = await bob.send("Hello!"); // create new conversation
    console.log(example1); // returns 'hey';

    let { req, res } = await bob.send("hey"); // create a new conversation because the last one was closed
    console.log(req.body); // returns 'yo';
    let howru = await res.reply("how r u"); // reply to the message
    console.log(howru); // returns 'gud';
});

exampleApp.on('message', async (req, res) => {
    if(req.body == "Hello!") {
        res.end("World!"); // end the conversation
    }

    if(req.body == "hey") {
        let { req, res } = await res.reply("yo"); // keep conversation open
        console.log(req.body); // how r u
        res.end("gud"); // close the conversation -- open a new one with 'send()' to start again
    }
});