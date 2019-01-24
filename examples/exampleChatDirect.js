const readline = require('readline');
const ip = require('ip');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const term = require( 'terminal-kit' ).terminal ;

let peerAddress = "";
let port = parseInt(Math.random() * 500) + 8000;
console.log('Initialized new node Example Chat')
console.log(`Node running on port ${port}`);
console.log(`Give this IP to your friend: ws/${ip.address()}:${port}`);

let inputField = null;

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

const { Node, Peer } = require('../src/main.js') // change to finjs for release

let exampleChat = new Node('exampleChat', {
  port: port
});

let height = 5;
let history = [];

function renderChat() {
  term.clear();

  for(let i = 0; i < Math.min(history.length, height); i++) {
    term.move(1, 1 + i);
    term.eraseLine();
    term.magenta(history[(history.length - Math.min(history.length, height)) + i]);
  }

  inputField.redraw();
}

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

    //term.clear();
    console.log('Initate the coversation');
    while (!exit) {
      let mes = await prompt('');
      if (mes === 'exit') return exit = true
      //console.log(`\nyou> ${mes}`)
      //history.push(`\nyou> ${mes}`);
      if (mes) friend.send(mes).catch(e => {
        console.log(e);
      })
      //renderChat();
    }
  });
});

exampleChat.on('message', async (msg) => {
  console.log(`\nfriend> ${msg.body}`)
  //history.push(`\nfriend> ${msg.body}`);
  //renderChat();
});

exampleChat.listen();