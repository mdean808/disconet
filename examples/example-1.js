const { Node, Peer } = require('finjs')
let exampleApp = new Node('example');

exampleApp.on('ready', async () => {
    console.log(await exampleApp.fetchPeers()); // should include self
    var bob = new Peer({address: 'ipv4/127.0.0.1'})
    await bob.send("Hello!");
});