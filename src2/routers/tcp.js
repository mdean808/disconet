const net = require('net');

module.exports = {
    name: 'tcp',
    connect: (url, socket) => { // { URL, main.Socket }
    // url obj
        newSocket = new net.Socket()
        newSocket.connect()
        let oldEmit = netSocket.emit;
        newSocket.emit = function() { 
            socket.emit.apply(socket, arguments); 
            return oldEmit.apply(this, arguments);
        }
        let socketMethods = Object.getOwnPropertyNames(socket.prototype)

        let safeMethods = ['address', 'destroy', 'end', 'pause', 'ref', 'resume', 'setEncoding', 'setKeepAlive', 'setNoDelay', 'setTimeout', 'unref', 'write'];
        let safeVariables = ['connecting', 'destroyed', 'localAddress', 'localPort', 'pending', 'remoteAccess', 'remoteFamily', 'remotePort']

        for (let i = 0; i < socketMethods.length; i ++) {
            if (safeMethods.indexOf(socketMethods[i]) > -1)  {
                socket[socketMethods[i]] = newSocket[socketMethods[i]]
            }
        }
        
        for (let i in safeVariables) {
            Object.defineProperty(newSocket, saveVariables[i], {
                get: () => {
                    return socket[saveVariables[i]]
                }, 
                set: (data) => {
                    socket[saveVariables[i]] = data
                }
            })
        }

    },
    listen: (port, node) => { // listen at port port
        const server = net.createServer((socket) => {
            socket.end('goodbye\n');
            node.emit('connection', socket)
          }).on('error', (err) => {
            throw err;
          });
    }
};