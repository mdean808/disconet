# K.js
A framework for easily creating decentralized applications in NodeJS

## Testing
1. Clone the Repository
2. Run `npm run testExample` to communicate with yourself using websockets.
3. Run `npm run testChat` to have a direct chat with a friend who also ran the command using websockets.

## Usage
```js
// Require the library
const { Node, Peer } = require('finjs')

// Create new node using a custom name and port
let exampleApp = new Node('example', {port: 8082});

// Start the node
exampleApp.listen();


// Wait for ready
exampleApp.on('ready', async () => {
    console.log('Example App Ready')

    // Speficy a new peer (localhost in this case)
    var newPeer = new Peer({node: exampleApp, address: 'ws/127.0.0.1:8082'})
    
    // Send "Hello" to the peer
    let helloWorld = await newPeer.send("Hello");

    console.log('Result from newPeer conversation:', helloWorld)
    // End the conversation with a message
    hellowWorld.end('Goodbye.');

    // You can also send a message without waiting for a response
    newPeer.push({data: 'Important Data'}); // You can also send an object
});

// Wait for a new message to the Node
exampleApp.on('message', async (msg) => {
    console.log("Message body:", msg.body);

    // Check the message type (so you don't respond when you don't need to)
    if (msg.type == 'push') {
        console.log('New Push!')
    } else {
        console.log(msg)
        if (msg.body !== 'Goodbye.') {
            // reply to the message
            msg.reply('World!')
        }
    }
});

```

## Examples
Browse the `examples` directory.
