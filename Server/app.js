// just here to test websocket connections

// Tutorial https://www.youtube.com/watch?v=1BfCnjr_Vjg
const http = require('http').createServer();
const port = 8002;

// take io packet
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

// listen for client connections
io.on('connection', (socket) => {
    console.log(`user: ${socket.id.substr(0, 3)} connected`);


    // message 'event': get message from client
    socket.on('message', (message) => {
        const output = `${socket.id.substr(0, 3)} said ${message}`;
        console.log(output);
        io.emit('message', output);
    });
});


http.listen(port, () => console.log(`Server listening on http://localhost:${port}`));