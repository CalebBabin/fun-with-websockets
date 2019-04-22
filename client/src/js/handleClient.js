const Canvas = require('./canvas.js');
class Handler {
    constructor (container) {
        this.canvas = new Canvas();
        this.ctx = this.canvas.context;
        this.container = container;

        this.clients = {};
    }

    clear () {
        this.canvas.clear();
        for (let index = 0; index < clients.length; index++) {
            const client = clients[index];
            client.element.parentElement.removeChild(client.element);
            delete client.element;
        }
        this.clients = {};
    }

    colorHash (hash) {
        let val = 1;
        for (let index = 0; index < hash.length; index++) {
            val += hash.charCodeAt(index);
        }
        for (let index = hash.length-1; index > 0; index--) {
            val += hash.charCodeAt(index) * hash.charCodeAt(index-1);
        }
        while(val > 360) val -= 360;
        return `hsl(${val}, 100%, 50%)`;
    }

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

    ingest (client) {
        if (!this.clients[client.id]) {
            this.initClient(client.id);
            this.clients[client.id].pos.x = client.events[0].x;
            this.clients[client.id].pos.y = client.events[0].y;
        }
        
        const interval = window.tickSpacing/client.events.length;
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.clients[client.id].color;
        this.ctx.moveTo(
            this.clients[client.id].pos.x*this.canvas.canvas.width,
            this.clients[client.id].pos.y*this.canvas.canvas.height
            )
    
        for (let index = 0; index < client.events.length; index++) {
            const e = client.events[index];
            if (e === 'disconnect') {
                this.clients[client.id].element.parentElement.removeChild(this.clients[client.id].element);
                delete this.clients[client.id];
                index = client.events.length;
            } else {
                const myX = Math.max(0, Math.min(1, e.x));
                const myY = Math.max(0, Math.min(1, e.y));
                setTimeout(()=>{
                    this.clients[client.id].element.style.left = myX*100+'%';
                    this.clients[client.id].element.style.top = myY*100+'%';
                }, interval*index);
    
                this.clients[client.id].pos.x = myX;
                this.clients[client.id].pos.y = myY;
    
                this.ctx.lineTo(
                    myX*this.canvas.canvas.width,
                    myY*this.canvas.canvas.height);
            }
    
        }
        this.ctx.stroke();
    }
}

module.exports = Handler;