const Canvas = require('./canvas.js');

const precalc = 180 / Math.PI;
class Handler {
    constructor (container) {
        this.canvas = new Canvas();
        this.ctx = this.canvas.context;
        this.container = container;

        this.clients = {};
    }

    getAngle (x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1) * precalc;
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

    pushHistory (id, pos) {
        for (let index = 0; index < this.clients[id].history.length-1; index++) {
            this.clients[id].history[index] = this.clients[id].history[index+1];
        }
        this.clients[id].history[this.clients[id].history.length-1] = pos;
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
            history: new Array(10),
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
    
        this.ctx.beginPath();
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
            } else if (e.c.clear) {
                this.clear();
            } else {

                /* 
                    take advantage of setTimeout to emulate the mouse moving in a realistic motion instead of jumping to the next position
                    The line drawing motion doesn't move smoothly to match, but that can be built in later.
                */
                setTimeout(()=>{
                    this.clients[client.id].element.style.left = e.x*100+'%';
                    this.clients[client.id].element.style.top = e.y*100+'%';
                    

                    /*
                        Rotate each cursor based on its current position vs 
                        the position it was in 10 ticks ago.
                    */
                    if (this.clients[client.id].history[0] !== undefined) {
                        this.clients[client.id].element.style.transform = 'rotate('+
                            (this.getAngle(
                                this.clients[client.id].history[0].x,
                                this.clients[client.id].history[0].y,
                                e.x,
                                e.y
                            )+135)
                        +'deg)';
                    }
                    this.pushHistory(
                        client.id,
                        e);
                    
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

        if (lineStarted) {
            /*
                If our line hasn't been closed yet, make sure that we pick back up once the next event packet comes in and finish off the stroke while we're at it.
            */
            this.ctx.stroke();
            if (!disconnect) this.clients[client.id].mousedown = true;
        } else {
            /*
                Make sure to mark this client as not currently drawing, so that we don't pick the stroke back up on the next event.
            */
            this.clients[client.id].mousedown = false;
        }
    }
}

module.exports = Handler;