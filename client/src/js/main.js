
const getQueryVariable = require('./utils/query_variable');

// Allow a query variable to be used for testing purposes.
const SERVER_URL = (getQueryVariable('server')) ? getQueryVariable('server') : 'wss://ws.opl.io';

const Variables = require('./variables');
Variables.last_position = {x: 0, y: 0};
Variables.current_state = {};

const option_to_int = require('./utils/options_to_int');
const int_to_option = require('./utils/int_to_option');
const EncoderClass = require('./utils/encoder');
const Favicon = require('./utils/favicon');

const Encoder = new EncoderClass(null);

window.addEventListener('DOMContentLoaded', () => {
    let socket = null;
    let myId = null;

    const ClientHandler = require('./utils/handleClient');
    const handler = new ClientHandler(document.body);
    
    const initSocket = () => {
        //Initiates the socket
        socket = new WebSocket(SERVER_URL);
        Encoder.socket = socket;

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
                    Favicon.generate(myId);
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



    //////////////////////////////////////////////
    ////////////////// Initiate //////////////////
    ////////////////// listeners /////////////////
    //////////////////////////////////////////////

    window.addEventListener('mousemove', (e) => {
        Encoder.send(
            e.clientX/window.innerWidth,
            e.clientY/window.innerHeight,
            Variables.current_state
        );
    })
    window.addEventListener('mousedown', (e) => {
        Variables.current_state.mousedown = true;
    })
    window.addEventListener('mouseup', (e) => {
        Variables.current_state.mousedown = false;
    })


    /*
        Touch listeners
    */
    window.addEventListener('touchmove', (e) => {
        e.preventDefault();
        Encoder.send(
            e.touches[0].clientX/window.innerWidth,
            e.touches[0].clientY/window.innerHeight,
            Variables.current_state
        );
        return false;
    })
    window.addEventListener('touchstart', (e) => {
        e.preventDefault();
        Variables.current_state.mousedown = true;
        Encoder.send(
            e.touches[0].clientX/window.innerWidth,
            e.touches[0].clientY/window.innerHeight,
            Variables.current_state
        );
        return false;
    })
    window.addEventListener('touchend', (e) => {
        e.preventDefault();
        Variables.current_state.mousedown = false;
        Encoder.send(
            Variables.last_position.x,
            Variables.last_position.y,
            Variables.current_state
        );
        return false;
    })


    const clearButton = document.createElement('button');
    clearButton.textContent = "Clear";
    document.body.appendChild(clearButton);
    clearButton.addEventListener('click', (e)=>{
        console.log('hi');
        Encoder.send(Variables.last_position.x, Variables.last_position.y, {clear: true});
        console.log('hi');
    });

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