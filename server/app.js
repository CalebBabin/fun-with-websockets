//Load in the config file for easy adjustments
const config = require(__dirname+'/config.js');

/////////////////////////////////////////////
///////////////// Utilities /////////////////
/////////////////////////////////////////////
const ResponseBuffer = require(__dirname+'/utils/responseBuffer.js');
const buffer = new ResponseBuffer();
const getUniqueId = require(__dirname+'/utils/uniqueId.js');
const parser = require(__dirname+'/utils/parser.js');


/////////////////////////////////////////////
///////////////// WebSockets ////////////////
/////////////////   Server  /////////////////
/////////////////////////////////////////////

const WebSocket = require('ws'); 
const wss = new WebSocket.Server(config.wss);



/*
    This interval will broadcast buffered information
    to clients in ticks to avoid sending too many packets.

    This will also allow us to compress some data, like
    converting an array of 4+ points into a bezier curve
    if it's short enough
*/
const tickInterval = setInterval(() => {
    if (buffer.isReady) {
        const response = buffer.compose();

        wss.clients.forEach(function each(ws) {
            for (let index = 0; index < response.length; index++) {
                ws.send(response[index]);
            }
        });
    }
}, config.tickrate);


/*
    Since this websocket library doesn't come with any
    dead socket detection, this relatively simple interval
    allows us to drop sockets that are inactive and broadcast
    this information to other clients.
*/
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log(`disconnecting ${ws.clientId}`)
            buffer.addEvent(ws.clientId, 'disconnect');
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });
}, config.heartrate);



//Initialize new websocket connections
wss.on('connection', function connection(ws, req) {
    const ip = (req.headers['X-Real-IP']) ? req.headers['X-Real-IP'] : req.connection.remoteAddress;
    ws.ipAddress = ip;

    //assign socket a unique ID and send it to the client
    ws.clientId = getUniqueId(wss);
    console.log(`${ws.clientId} connected from ${ip}`);
    ws.send(JSON.stringify({
        id: ws.clientId,
        tickSpacing: config.tickrate,
    }))

    //pass incoming messages into the parser with the websocket and buffer instance.
    ws.on('message', function incoming(message) {
        parser(ws, message, buffer);
    });

    //heartbeat listener
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    ws.isAlive = true;

    //listen for disconnected sockets and broadcast this information
    ws.on('close', () => {
        console.log(`disconnecting ${ws.clientId} gracefully`)
        buffer.addEvent(ws.clientId, 'disconnect');
    });
});
