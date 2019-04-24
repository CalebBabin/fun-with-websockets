
const getQueryVariable = (variable) => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}

// Allow a query variable to be used for testing purposes.
const SERVER_URL = (getQueryVariable('server')) ? getQueryVariable('server') : 'wss://ws.opl.io';

const OPTION_MAP = {
    mousedown: 0,
    disconnect: 7,
}
const OPTION_MAP_ARRAY = [];
const CURRENT_STATE = {
    mousedown: false,
}

const last_position = {x: 0, y: 0};

for (const key in OPTION_MAP) {
    if (OPTION_MAP.hasOwnProperty(key)) {
        OPTION_MAP_ARRAY[OPTION_MAP[key]] = key;
    }
}

const option_to_int = (options) => {
    /*
        Converts our basic options object into an integer
    */
    let string = '00000000'.split('');
    for (const key in options) {
        if (options.hasOwnProperty(key) && OPTION_MAP.hasOwnProperty(key)) {
            if (options[key]) {
                string[OPTION_MAP[key]] = '1';
            }
        }
    }
    string = string.join('');
    return parseInt('0'+string, 2);
}
const int_to_option = (int) => {
    /*
        Converts an integer into our basic options object
    */
    if (int === 1) return {disconnect: true};
    const string = Number(int).toString(2);
    const options = {};
    
    for (let index = 0; index < string.length; index++) {
        if (string[index] === '1') {
            options[OPTION_MAP_ARRAY[index]] = true;
        }
    }

    return options;
}

const constrainToOne = (number) => {
    return Math.min(1, Math.max(0, number));
}

window.addEventListener('DOMContentLoaded', () => {
    let socket = null;
    let myId = null;

    const ClientHandler = require('./handleClient.js');
    const handler = new ClientHandler(document.body);
    
    const initSocket = () => {
        //Initiates the socket
        socket = new WebSocket(SERVER_URL);

        //Sets the binary data type of the socket to the type of our choice
        socket.binaryType = 'arraybuffer';

        //Listens for messages from our server
        socket.onmessage = (message) => {

            if (typeof message.data === 'string') {
                /*
                    Checks for special JSON encoded data first
                */
                const data = JSON.parse(message.data);
                if (data.id) {
                    myId = data.id;
                    window.TICK_SPACING = data.tickSpacing;
                }
            } else {
                /*
                    The bulk of communications are encoded in Binary for reduced network latency
                */
                const dv = new DataView(message.data, 0);
                const events = (message.data.byteLength - 2)/5;
                
                const client = {
                    id: dv.getUint16(0),
                    events: []
                }

                for (let index = 0; index < events; index++) {
                    /*
                        Structure of our response:
            
                        First 2 bytes: Client ID
            
                        (repeated)
                        Next 2 bytes: X position
                        Next 2 bytes: Y position
                        Next 1 byte: Configuration object as int
                    
                    */ 
                    const offset = index*5 + 2;
                    client.events.push({
                        x: dv.getUint16(offset + 0)/65536,
                        y: dv.getUint16(offset + 2)/65536,
                        c: int_to_option(dv.getUint8(offset + 4))
                    })
                }
                
                //Pass our parsed data to the handler to actually render on the DOM
                handler.ingest(client);
            }
            

        }

    }

    const send = (x, y, options) => {
        /*
            Structure of a payload

            First 2 bytes: X position
            Next  2 bytes: Y position
            Next  1 byte: Configuration object as int

            Compressed into binary to lower latency over the network
        */ 

        const buffer = new ArrayBuffer(5);
        const dv = new DataView(buffer, 0);
        last_position.x = x;
        last_position.y = y;
        dv.setUint16(0, Math.floor(constrainToOne(x)*65535));
        dv.setUint16(2, Math.floor(constrainToOne(y)*65535));
        dv.setUint8(4, option_to_int(options));
        socket.send(buffer);
    }



    //////////////////////////////////////////////
    ////////////////// Initiate //////////////////
    ////////////////// listeners /////////////////
    //////////////////////////////////////////////

    window.addEventListener('mousemove', (e) => {
        send(
            e.clientX/window.innerWidth,
            e.clientY/window.innerHeight,
            CURRENT_STATE
        );
    })
    window.addEventListener('mousedown', (e) => {
        CURRENT_STATE.mousedown = true;
    })
    window.addEventListener('mouseup', (e) => {
        CURRENT_STATE.mousedown = false;
    })


    /*
        Touch listeners
    */
    window.addEventListener('touchmove', (e) => {
        e.preventDefault();
        send(
            e.touches[0].clientX/window.innerWidth,
            e.touches[0].clientY/window.innerHeight,
            CURRENT_STATE
        );
        return false;
    })
    window.addEventListener('touchstart', (e) => {
        e.preventDefault();
        CURRENT_STATE.mousedown = true;
        send(
            e.touches[0].clientX/window.innerWidth,
            e.touches[0].clientY/window.innerHeight,
            CURRENT_STATE
        );
        return false;
    })
    window.addEventListener('touchend', (e) => {
        e.preventDefault();
        CURRENT_STATE.mousedown = false;
        send(
            last_position.x,
            last_position.y,
            CURRENT_STATE
        );
        return false;
    })
    //////////////////////////////////////////////
    ////////////////// End      //////////////////
    ////////////////// listeners /////////////////
    //////////////////////////////////////////////


    initSocket();

    // Check if the socket ever goes dead and restart it
    setInterval(()=>{
        if (socket.readyState > 1) {
            handler.clear();
            initSocket();
        }
    }, 5000);

});