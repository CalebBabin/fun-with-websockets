const Variables = require('./variables');
const Constrain = require('./utils/constrain');
const options_to_int = require('./utils/options_to_int');

class Encoder {
    constructor (websocket) {
        this.socket = websocket;
    }
    
    send (x, y, options) {
        /*
            Structure of a payload

            First 2 bytes: X position
            Next  2 bytes: Y position
            Next  1 byte: Configuration object as int

            Compressed into binary to lower latency over the network
        */ 
        const buffer = new ArrayBuffer(5);
        const dv = new DataView(buffer, 0);
        Variables.last_position.x = x;
        Variables.last_position.y = y;
        dv.setUint16(0, Math.floor(Constrain.toOne(x)*65535));
        dv.setUint16(2, Math.floor(Constrain.toOne(y)*65535));
        dv.setUint8(4, options_to_int(options));
        this.socket.send(buffer);
    }
}

module.exports = Encoder;