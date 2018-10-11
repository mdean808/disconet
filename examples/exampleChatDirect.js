const readline = require('readline');
const ip = require('ip');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let peerAddress = "";
let port = parseInt(Math.random() * 500) + 8000;
console.log('Initialized new node Example Chat')
console.log(`Node running on port ${port}`);
console.log(`Give this IP to your friend: ws/${ip.address()}:${port}`);

const { Node, Peer } = require('../src/main.js') // change to finjs for release
let exampleChat = new Node('exampleChat', {port: port});
exampleChat.on('ready', async () => {
  rl.question('connect>', (answer) => {
    console.log(`Connecting to: ${answer}`);
    peerAddress = answer;


      var friend = new Peer({node: exampleChat, address: peerAddress})
    
      let rlchat = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rlchat.question('say>', (answer) => {
        console.log(`you> ${answer}`);
        peerAddress = answer;

        friend.send(answer);
      
        rlchat.close();
      });

      rl.close();
    });
});

exampleChat.on('message', async (msg) => {
    console.log(`friend> ${msg.body}`);
});

exampleChat.listen();
