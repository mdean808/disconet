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

function prompt(question) {
  return new Promise((res, rej) => {
    let rlchat = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rlchat.question(question, (mes) => {
      res(mes);
      rlchat.close();
    });
  });
}

const {
  Node,
  Peer
} = require('../src/main.js') // change to finjs for release

let exampleChat = new Node('exampleChat', {
  port: port
});

exampleChat.on('ready', async () => {
  let exit = false
  rl.question('connect>', async (answer) => {
    console.log(`Connecting to: ${answer}`);
    peerAddress = answer;
    var friend = new Peer({
      node: exampleChat,
      address: peerAddress
    })
    rl.close();

    while (!exit) {
      let mes = await prompt('say>');
      if (mes === 'exit') return exit = true
      console.log(`you> ${mes}`);

      friend.send(mes);
    }
  });
});

exampleChat.on('message', async (msg) => {
  console.log(`friend> ${msg.body}`);
});

exampleChat.listen();