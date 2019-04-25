/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	
	const getQueryVariable = __webpack_require__(1);

	// Allow a query variable to be used for testing purposes.
	const SERVER_URL = (getQueryVariable('server')) ? getQueryVariable('server') : 'wss://ws.opl.io';

	const Variables = __webpack_require__(2);
	Variables.last_position = {x: 0, y: 0};
	Variables.current_state = {};

	const option_to_int = __webpack_require__(3);
	const int_to_option = __webpack_require__(4);
	const EncoderClass = __webpack_require__(5);

	const Encoder = new EncoderClass(null);

	window.addEventListener('DOMContentLoaded', () => {
	    let socket = null;
	    let myId = null;

	    const ClientHandler = __webpack_require__(7);
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

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = (variable) => {
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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	const Variables = {

	    // the option map is an object which maps each function to a bit in our configuration byte.
	    // values can only be true or false.
	    OPTION_MAP: {
	        mousedown: 0,
	        clear: 1,
	        disconnect: 7,
	    },

	    // the option map array is a companion variable to the option map, which is a reverse mapping of bit indexes to their representations. filled out automatically.
	    OPTION_MAP_ARRAY: [],
	}


	for (const key in Variables.OPTION_MAP) {
	    if (Variables.OPTION_MAP.hasOwnProperty(key)) {
	        Variables.OPTION_MAP_ARRAY[Variables.OPTION_MAP[key]] = key;
	    }
	}


	module.exports = Variables;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	const Variables = __webpack_require__(2);

	module.exports = (options) => {
	    /*
	        Converts our basic options object into an integer
	    */
	    let string = '00000000'.split('');
	    for (const key in options) {
	        if (options.hasOwnProperty(key) && Variables.OPTION_MAP.hasOwnProperty(key)) {
	            if (options[key]) {
	                string[Variables.OPTION_MAP[key]] = '1';
	            }
	        }
	    }
	    string = string.join('');
	    return parseInt('0'+string, 2);
	}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	const Variables = __webpack_require__(2);

	module.exports = (int) => {
	    /*
	        Converts an integer into our basic options object
	    */
	    if (int === 1) return {disconnect: true};
	    let string = Number(int).toString(2);
	    while (string.length < 8) string = '0'+string;
	    const options = {};
	    
	    for (let index = 0; index < string.length; index++) {
	        if (string[index] === '1') {
	            options[Variables.OPTION_MAP_ARRAY[index]] = true;
	        }
	    }

	    return options;
	}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	const Variables = __webpack_require__(2);
	const Constrain = __webpack_require__(6);
	const options_to_int = __webpack_require__(3);

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

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	class Constrain {
	    constructor () {

	    }

	    static toOne (number) {
	        return Math.min(1, Math.max(0, number));
	    }

	}

	module.exports = Constrain;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	const Canvas = __webpack_require__(8);
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

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	class Canvas {
	    constructor () {
	        this.canvas = document.createElement('canvas');
	        this.context = this.canvas.getContext('2d');
	        
	        this.offcanvas = document.createElement('canvas');
	        this.offcontext = this.offcanvas.getContext('2d');

	        setTimeout(this.init.bind(this), 1);
	        window.addEventListener('resize', this.resize.bind(this));
	    }

	    init () {
	        document.body.appendChild(this.canvas);
	        this.resize();
	    }

	    clear () {
	        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
	    }

	    resize () {
	        this.offcanvas.width = this.canvas.width;
	        this.offcanvas.height = this.canvas.height;

	        this.offcontext.drawImage(this.canvas, 0, 0);

	        this.canvas.width = window.innerWidth;
	        this.canvas.height = window.innerHeight;
	        this.context.drawImage(this.offcanvas, 0, 0, this.canvas.width, this.canvas.height);
	    }
	}
	module.exports = Canvas;

/***/ })
/******/ ]);