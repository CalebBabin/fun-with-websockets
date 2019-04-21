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
/***/ (function(module, exports) {

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
	                activeClients[client.id].element.style.left = Math.max(0, Math.min(100, e.x*100))+'%';
	                activeClients[client.id].element.style.top = Math.max(0, Math.min(100, e.y*100))+'%';
	            }, interval*index);
	        }

	    }
	}

/***/ })
/******/ ]);