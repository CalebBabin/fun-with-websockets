module.exports = (socket, message, responseBuffer) => {
    try {
        const data = JSON.parse(message);
        const output = {
            x: Math.max(0, Math.min(1, Number(data.x))),
            y: Math.max(0, Math.min(1, Number(data.y))),
        }
        responseBuffer.addEvent(socket.clientId, data);
    } catch(e) {
        console.error( new Error(e));
    }
};