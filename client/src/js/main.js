const socket = new WebSocket('wss://ws.opl.io');
let myId = null;


const handleClient = require('./handleClient.js');


socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.id) {
        myId = data.id;
        window.tickSpacing = data.tickSpacing;
    }

    if (data.clients) {
        for (let index = 0; index < data.clients.length; index++) {
            const client = data.clients[index];
            //if (client.id !== myId) {
                handleClient(client);
            //}
        }
    }

}

window.addEventListener('mousemove', (e) => {
    const payload = {
        x: e.clientX/window.innerWidth,
        y: e.clientY/window.innerHeight,
    };
    socket.send(JSON.stringify(payload));
})