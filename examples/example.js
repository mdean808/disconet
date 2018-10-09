const { Node, Peer } = require('../src/main.js') // change to finjs for release
let exampleApp = new Node('example', {port: 8081});
console.log('Initialized new node Example App')
exampleApp.on('ready', async () => {
    
    console.log('Example App Ready')
    //console.log(await exampleApp.fetchPeers()); // should include self

    var bob = new Peer({node: exampleApp, address: 'http/127.0.0.1:8081'})
    
    let helloWorld = await bob.send("Hello!"); // create new conversation
    console.log('HelloWorld Result', helloWorld); // returns 'World!';

    let dataMessage = await bob.send({msg: 'Data', status: 'incoming'}); // create a new conversation because the last one was closed
    console.log(dataMessage.req.body); // returns "That is some super important data!";
    
    let howru = await dataMessage.res.reply("Thanks for you opinion"); // reply to the message
    console.log(howru.req.body); // returns 'Welp, it was nice tak\lking to ya';
});

exampleApp.on('message', async (req, res) => {
    console.log('Received message')
    console.log(req.body);
    if(req.body == "Hello!") {
        console.log('Received Hello')
        res.end("World!"); // end the conversation
    }

    if(req.body.status == "incoming") {
        console.log(req.body.msg) // returns "Data"
        let dataReply = await res.reply("That is some super important data!"); // keep conversation open
        console.log(dataReply); // Thanks for your opinion
        dataReply.res.end("Welp, it was nice talking to ya"); // close the conversation -- open a new one with 'send()' to start again
    }
});

exampleApp.listen();