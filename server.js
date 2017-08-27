var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var path = require("path");

//Variables
users = [];
connections = [];

//Serve static file
app.use(express.static(path.join(__dirname, "public")));

//Setup server at port 3000
server.listen(3000);
console.log("Server is running on http://localhost:3000.");

//Setup middleware
app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function(socket){
    connections.push(socket);

    //When connected
    console.log("Connected: %s socket(s) connected.", connections.length);

    //When disconnected
    socket.on("disconnect", function(data){
        users.splice(users.indexOf(socket.username));
        updateUsers();

        connections.splice(connections.indexOf(socket), 1);
        console.log("Disconnected: %s socket(s) connected.", connections.length);
    });

    //Sign in
    socket.on("new", function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);

        updateUsers();
    });

    function updateUsers(){
        io.sockets.emit("get-users", users);
    }

    //Send message
    socket.on("send", function(data){
        console.log("\nServer has received a new message: " + data);
        io.sockets.emit( "New message", {message: data, user: socket.username});
    });
});