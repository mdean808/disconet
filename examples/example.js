const assert = require('assert');

const { Node, Peer } = require('../src/main.js') // change to finjs for release
let exampleApp = new Node('example', {port: 8082});
console.log('Initialized new node Example App')
exampleApp.on('ready', async () => {
    
    console.log('Example App Ready')
    //console.log(await exampleApp.fetchPeers()); // should include self

    var bob = new Peer({node: exampleApp, address: 'http/127.0.0.1:8082'})
    
    let helloWorld = await bob.send("Hello!"); // create new conversation
    console.log('HelloWorld Result', helloWorld);
    assert.strictEqual(helloWorld, 'World!');
    
    // create a new conversation because the last one was closed
    let dataMessage = await bob.send({msg: 'Data', status: 'incoming'}); 

    // get the reply
    assert.strictEqual(dataMessage.body, "That is some super important data!");
    
    // reply to the reply
    let howru = await dataMessage.reply("Thanks for you opinion"); // reply to the message
    assert.strictEqual(howru, "Welp, it was nice talking to ya");

    console.log('Test Completed!')
});

exampleApp.on('message', async (msg) => {
    if(msg.body == "Hello!") {
        console.log('Ending the convo the first time');
        msg.end("World!"); // end the conversation
    }

    console.log(msg.body);
    if(msg.body.status == "incoming") {
        console.log(msg.body.msg) // returns "Data"
        let dataReply = await msg.reply("That is some super important data!"); // keep conversation open
        console.log(dataReply.body); // Thanks for your opinion
        dataReply.end("Welp, it was nice talking to ya"); // close the conversation -- open a new one with 'send()' to start again
    }
});

exampleApp.listen();