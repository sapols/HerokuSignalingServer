const WebSocket = require('ws');
const ip = require('ip');
var express = require('express');
var path = require('path');

var app = express();
var cons = require('consolidate');

//View engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname , '/views'));
app.set('view engine', 'html');

//Signaling server 
let serverPort = process.env.PORT;
if (serverPort == null || serverPort == "") {
  serverPort = 8000;
}
let serverIP = ip.address();

const wss = new WebSocket.Server({ port: serverPort }, () => {
   console.log(`Shawn's WebSocket Server is running! (URL: ws://${serverIP}:${serverPort})`);
   console.log("The signaling server is now listening on port " + serverPort);
});

// Broadcast to all.
wss.broadcast = (ws, data) => {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', (ws, req) => {
    console.log(`Client with IP ${req.connection.remoteAddress} connected. Total connected clients: ${wss.clients.size}`);
    
    ws.onmessage = (message) => {
        console.log(message.data + "\n");
        wss.broadcast(ws, message.data);
    }

    ws.onclose = () => {
        console.log(`Client with IP ${req.connection.remoteAddress} disconnected. Total connected clients: ${wss.clients.size}`)
    }
});
