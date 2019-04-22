module.exports = (socket, message, responseBuffer) => {
    try {
        const data = JSON.parse(message);
        const output = {};

        if (data.x !== undefined && data.y !== undefined) {
            output.x = Math.max(0, Math.min(1, Number(data.x)))
            output.y = Math.max(0, Math.min(1, Number(data.y)))
        }
        
        if (data.mousedown !== undefined) output.mousedown = true;
        if (data.mouseup !== undefined) output.mouseup = true;
        
        responseBuffer.addEvent(socket.clientId, output);

    } catch(e) {
        // if the client throws us some incorrectly encoded json don't throw
        console.error( new Error(e) );
    }
};