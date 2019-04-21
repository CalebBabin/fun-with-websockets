class ResponseBuffer {
    constructor () {
        this.disconnects = [];
        this.clients = {};
        this.isReady = false;
    }

    clear () {
        this.isReady = false;
        this.clients = {};
        this.disconnects = [];
    }

    compose () {
        const response = {
            clients: [],
        };

        for (const client in this.clients) {
            if (this.clients.hasOwnProperty(client)) {
                response.clients.push({
                    id: client,
                    events: this.clients[client]
                });
            }
        }

        if(this.disconnects.length > 0) {
            response.disconnects = disconnects;
        }

        this.clear();
        return JSON.stringify(response);
    }

    addEvent (clientId, event) {
        this.isReady = true;
        if (!this.clients[clientId]) {
            this.clients[clientId] = [];
        }
        this.clients[clientId].push(event);
    }
}

module.exports = ResponseBuffer;
