const getId = (server) => {
    const newId = Math.random()*1000000000000000000;

    let match = false;

    server.clients.forEach(function each(ws) {
        if (ws.clientId === newId) match = true;
    });

    if (!match) return newId;

    return getId(server);
}

module.exports = getId;