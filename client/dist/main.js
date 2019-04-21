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

	let socket = null;
	let myId = null;

	const handleClient = __webpack_require__(1);
	const initSocket = () => {
	    socket = new WebSocket('wss://ws.opl.io');

	    socket.onmessage = (message) => {
	        const data = JSON.parse(message.data);
	        if (data.id) {
	            myId = data.id;
	            window.tickSpacing = data.tickSpacing;
	        }
	    
	        if (data.clients) {
	            for (let index = 0; index < data.clients.length; index++) {
	                const client = data.clients[index];
	                //if (client.id !== myId) {
	                    handleClient(client);
	                //}
	            }
	        }
	    }

	}


	window.addEventListener('mousemove', (e) => {
	    const payload = {
	        x: e.clientX/window.innerWidth,
	        y: e.clientY/window.innerHeight,
	    };
	    socket.send(JSON.stringify(payload));
	})
	window.addEventListener('touchmove', (e) => {
	    e.preventDefault();
	    const payload = {
	        x: e.touches[0].clientX/window.innerWidth,
	        y: e.touches[0].clientY/window.innerHeight,
	    };
	    socket.send(JSON.stringify(payload));
	    return false;
	})
	window.addEventListener('touchstart', (e) => {
	    e.preventDefault();
	    return false;
	})
	window.addEventListener('touchend', (e) => {
	    e.preventDefault();
	    return false;
	})

	initSocket();

	setInterval(()=>{
	    if (socket.readyState > 1) {
	        initSocket();
	    }
	}, 5000);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	const Canvas = __webpack_require__(2);
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

/***/ }),
/* 2 */
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