module.exports = (socket, message, responseBuffer) => {
    //add input validation and sanitization here.

    try {
        const data = JSON.parse(message);
        responseBuffer.addEvent(socket.clientId, data);
    } catch(e) {
        console.error( new Error(e));
    }
};