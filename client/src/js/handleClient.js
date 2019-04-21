const activeClients = {};

const initClient = (id) => {
    activeClients[id] = {
        pos: {
            x: 0.5,
            y: 0.5,
        },
        element: document.createElement('div'),
    };

    activeClients[id].element.classList.add('client');

    document.body.appendChild(activeClients[id].element);
}

module.exports = (client) => {
    if (!activeClients[client.id]) {
        initClient(client.id);
    }
    
    const interval = window.tickSpacing/client.events.length;

    for (let index = 0; index < client.events.length; index++) {
        const e = client.events[index];
        if (e === 'disconnect') {
            activeClients[client.id].element.parentElement.removeChild(activeClients[client.id].element);
            delete activeClients[client.id];
            index = client.events.length;
        } else {
            setTimeout(()=>{
                activeClients[client.id].element.style.left = e.x*100+'%';
                activeClients[client.id].element.style.top = e.y*100+'%';
    
            }, interval*index);
        }

    }
}