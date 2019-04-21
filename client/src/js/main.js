let socket = null;
let myId = null;

const handleClient = require('./handleClient.js');
const initSocket = () => {
    socket = new WebSocket('wss://ws.opl.io');

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

}


window.addEventListener('mousemove', (e) => {
    const payload = {
        x: e.clientX/window.innerWidth,
        y: e.clientY/window.innerHeight,
    };
    socket.send(JSON.stringify(payload));
})
window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const payload = {
        x: e.touches[0].clientX/window.innerWidth,
        y: e.touches[0].clientY/window.innerHeight,
    };
    socket.send(JSON.stringify(payload));
    return false;
})
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    return false;
})
window.addEventListener('touchend', (e) => {
    e.preventDefault();
    return false;
})

initSocket();

setInterval(()=>{
    if (socket.readyState > 1) {
        initSocket();
    }
}, 5000);