const Canvas = require('./canvas.js');
class Handler {
    constructor (container) {
        this.canvas = new Canvas();
        this.ctx = this.canvas.context;
        this.container = container;

        this.clients = {};
    }

    /*
        Clears out all of our pointers and wipes the canvas clean.
    */
    clear () {
        this.canvas.clear();
        for (const id in this.clients) {
            this.clients[id].element.parentElement.removeChild(this.clients[id].element);
        }
        this.clients = {};
    }

    /*
        Converts our ID (which is now an integer) into a hopefully unique hue
    */
    colorHash (hash) {
        while(hash > 360) hash -= 360;
        return `hsl(${hash}, 100%, 50%)`;
    }

    /*
        Initiates the object for a new client and adds a pointer element to the DOM
    */
    initClient (id) {
        this.clients[id] = {
            pos: {
                x: 0.5,
                y: 0.5,
            },
            color: this.colorHash(id),
            element: document.createElement('div'),
        };

        this.clients[id].element.classList.add('client');
        this.container.appendChild(this.clients[id].element);
    }

    /*
        The main ingest for parsed messages from the server
    */
    ingest (client) {
        if (!this.clients[client.id]) {
            this.initClient(client.id);
            this.clients[client.id].pos.x = client.events[0].x;
            this.clients[client.id].pos.y = client.events[0].y;
        }
        let disconnect = false;
        
        const interval = window.TICK_SPACING/client.events.length;
        this.ctx.strokeStyle = this.clients[client.id].color;
    
        let lineStarted = false;
        if (this.clients[client.id].mousedown) {
            lineStarted = true;
            this.ctx.moveTo(
                this.clients[client.id].pos.x*this.canvas.canvas.width,
                this.clients[client.id].pos.y*this.canvas.canvas.height
                );
        }
        for (let index = 0; index < client.events.length; index++) {
            const e = client.events[index];
            if (e.c.disconnect) {
                disconnect = true;
                this.clients[client.id].element.parentElement.removeChild(this.clients[client.id].element);
                delete this.clients[client.id];
                index = client.events.length;
                this.ctx.stroke();
                return;
            } else {

                /* 
                    take advantage of setTimeout to emulate the mouse moving in a realistic motion instead of jumping to the next position
                    The line drawing motion doesn't move smoothly to match, but that can be built in later.
                */
                setTimeout(()=>{
                    this.clients[client.id].element.style.left = e.x*100+'%';
                    this.clients[client.id].element.style.top = e.y*100+'%';
                }, interval*index);
    
                /*
                    Sets the clients current position
                */
                this.clients[client.id].pos.x = e.x;
                this.clients[client.id].pos.y = e.y;

                if (e.c.mousedown && !lineStarted) {
                    /*
                        If our line hasn't been started but the mouse is down, start the path
                    */
                    this.ctx.beginPath();
                    this.ctx.moveTo(
                        this.clients[client.id].pos.x*this.canvas.canvas.width,
                        this.clients[client.id].pos.y*this.canvas.canvas.height
                        );
                    lineStarted = true;
                }
    
                /*
                    Continue our stroke if it's started
                */
                if (lineStarted) {
                    this.ctx.lineTo(
                        e.x*this.canvas.canvas.width,
                        e.y*this.canvas.canvas.height);
                }

                /*
                    End our stroke if the mouseup event is present.
                */
                if (!e.c.mousedown && lineStarted) {
                    this.ctx.stroke();
                    lineStarted = false;
                }
            }
    
        }

        if (lineStarted && !disconnect) {
            /*
                If our line hasn't been closed yet, make sure that we pick back up once the next event packet comes in and finish off the stroke while we're at it.
            */
            this.ctx.stroke();
            this.clients[client.id].mousedown = true;
        } else {
            /*
                Make sure to mark this client as not currently drawing, so that we don't pick the stroke back up on the next event.
            */
            this.clients[client.id].mousedown = false;
        }
    }
}

module.exports = Handler;