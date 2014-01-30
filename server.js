/* serverside code */
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server); /* socket.io for sending scenes to user */
var fs = require('fs') /* file system for opening files */
var STARTING_SCENE="Start";
var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", 
             "October", "Nobember", "December"];

/* turn on console logging for server*/
app.use(express.logger('dev'));

/* for static web pages */
app.use(express.static(path.join(__dirname, 'public')));


/* socket.io */
io.sockets.on('connection', function (socket) {

  
  fs.appendFile("./users.txt", 
                "Time: "+ formatDate(new Date() ) +" | IP: " +  socket.handshake.address.address +" |\n",
                function(err){
                  if (err) console.log("ERROR saving user file: " + formatDate(new Date() ) + " " + socket.handshake.address);
                });

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
    if (data[0]!=null && data[0].length>0 && data[0].indexOf("\\") == -1 && data[0].indexOf("/") == -1)
    {
        /* get the list of valid files*/
        fs.readdir("public/Scenes/", function (err1, files)
        {
            for (var i=0; i<files.length; i++)
            {
               if (data[0] + ".txt" === files[i])
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
        });
       
    }

}

function formatDate(date)
{
    return ""+month[date.getMonth()] +" " + date.getDate() + ", " + date.getHours() + ":" + date.getMinutes() + 
           "   " + date.getSeconds();
}

