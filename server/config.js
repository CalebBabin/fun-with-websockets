module.exports = {
    //batch send broadcasts every x milliseconds
    tickrate: 1000/2,
    
    //drop dead connections after x milliseconds
    heartrate: 10000,

    //websocket server configuration object
    wss: {
        port: 8889,
    },

}