const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 8889 });

const getUniqueId = require(__dirname+'/uniqueId.js');
const parser = require(__dirname+'/parser.js');
const ResponseBuffer = require(__dirname+'/responseBuffer.js');
const buffer = new ResponseBuffer();

const tickSpacing = 1000/5; // the max rate we'll send data out, x times per second.

const tickInterval = setInterval(() => {
    if (buffer.isReady) {
        const response = buffer.compose();

        wss.clients.forEach(function each(ws) {
            ws.send(response);
        });
    }
}, tickSpacing);


wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        parser(ws, message, buffer);
    });

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.clientId = getUniqueId(wss);
    ws.send(JSON.stringify({
        id: ws.clientId,
        tickSpacing: tickSpacing,
    }))
});

const heartbeatInterval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            console.log(`disconnecting ${ws.clientId}`)
            buffer.addEvent(ws.clientId, 'disconnect');
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });
}, 10000);