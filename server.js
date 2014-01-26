/* serverside code */
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server); /* socket.io for sending scenes to user */
var fs = require('fs') /* file stream for opening files */
var STARTING_SCENE="Start";


/* turn on console logging for server*/
app.use(express.logger('dev'));


/* for static web pages */
app.use(express.static(path.join(__dirname, 'public')));


/* socket.io */
io.sockets.on('connection', function (socket) {

  sendScene(socket, [STARTING_SCENE]);

   /* when the server receives a request for a new scene */
   socket.on('newScene', function(data){
       sendScene(socket, data);
   });
});

// Route for everything else - 404 error.
 app.get('*', function(req, res){
    res.send(404);//render('public/404.html');
   });

server.listen(8080);

function sendScene( socket, data )
{
    /* Read code from text file */
    /* first check for invalid input */
    if (data[0].indexOf("\\") == -1 && data[0].indexOf("/") == -1)
    {
       /* try to read the file */
       fs.readFile("public/Scenes/"+data[0]+".txt", 'utf8', 
                   function(err, result) { 
                      if (err){ /*do nothing*/ /* problem has occured*/}

                      /* send to client */
                      socket.emit('newScene', [result]);
                   });
    }

}