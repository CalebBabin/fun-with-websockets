const Canvas = require('./canvas.js');
const canvas = new Canvas();
const ctx = canvas.context;

const activeClients = {};

const colorHash = (hash) => {
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

const initClient = (id) => {
    activeClients[id] = {
        pos: {
            x: 0.5,
            y: 0.5,
        },
        color: colorHash(id),
        element: document.createElement('div'),
    };

    activeClients[id].element.classList.add('client');

    document.body.appendChild(activeClients[id].element);
}

module.exports = (client) => {
    if (!activeClients[client.id]) {
        initClient(client.id);
        activeClients[client.id].pos.x = client.events[0].x;
        activeClients[client.id].pos.y = client.events[0].y;
    }
    
    const interval = window.tickSpacing/client.events.length;
    ctx.beginPath();
    ctx.strokeStyle = activeClients[client.id].color;
    ctx.moveTo(
        activeClients[client.id].pos.x*window.innerWidth,
        activeClients[client.id].pos.y*window.innerHeight
        )

    for (let index = 0; index < client.events.length; index++) {
        const e = client.events[index];
        if (e === 'disconnect') {
            activeClients[client.id].element.parentElement.removeChild(activeClients[client.id].element);
            delete activeClients[client.id];
            index = client.events.length;
        } else {
            const myX = Math.max(0, Math.min(1, e.x));
            const myY = Math.max(0, Math.min(1, e.y));
            setTimeout(()=>{
                activeClients[client.id].element.style.left = myX*100+'%';
                activeClients[client.id].element.style.top = myY*100+'%';
            }, interval*index);

            activeClients[client.id].pos.x = myX;
            activeClients[client.id].pos.y = myY;

            ctx.lineTo(
                myX*window.innerWidth,
                myY*window.innerHeight);
        }

    }
    ctx.stroke();

}