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

    formBinaryResponse (events, client) {
        /*
            Structure of our response:

            First 2 bytes: Client ID

            (repeated)
            Next 2 bytes: X position
            Next 2 bytes: Y position
            Next 1 byte: Configuration object as Uint
        
        */ 
        const buffer = new ArrayBuffer(2 + 5*events.length);
        const dv = new DataView(buffer, 0);
        console.log('id', client);
        dv.setUint16(0, client);
        for (let index = 0; index < events.length; index++) {
            const event = events[index];
            const offset = 2 + index*5;
            if (event === 'disconnect') {
                dv.setUint8(offset + 4, 1);
            } else {
                dv.setUint16(offset, event.x);
                dv.setUint16(offset + 2, event.y);
                dv.setUint8(offset + 4, event.config);
            }
        }
        console.log(buffer, 'hi');
        return buffer;
    }

    compose () {
        const response = []

        for (const client in this.clients) {
            console.log('clientID', client)
            if (this.clients.hasOwnProperty(client)) {
                console.log('clientID2', client)
                response.push(this.formBinaryResponse(this.clients[client], client));
                /*
                    {
                    id: client,
                    events: this.clients[client]
                });*/
            }
        }

        this.clear();
        return response;
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
