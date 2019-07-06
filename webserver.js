var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)

//var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
//var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output

var piblaster = require('pi-blaster.js');

http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
    fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
            return res.end("404 Not Found");
        }
        res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
        res.write(data); //write data from index.html
        return res.end();
    });
}

io.sockets.on('connection', function (socket) {// WebSocket Connection
    console.log( 'connection!' );

    socket.on('toggleDoor', function(data) { //get light switch status from client
        console.log( 'door toggled by:', data.userName );
        fs.appendFile( 'log.txt', 'Door toggled by: ' + data.userName + '\n', function( err ) {
            if( err ) {
                console.log( err );
            }

        } );
        //console.log( LED.readSync() );
        piblaster.setPwm(25, 0.155);

        setTimeout( () => {
            piblaster.setPwm( 25, 0.14 );
        }, 500 );

        //LED.writeSync( LED.readSync() === 0 ? 1 : 0 ); //turn LED on or off
        socket.emit( 'doorToggled', true );
    });
});

process.on('SIGINT', function () { //on ctrl+c
    //LED.writeSync(0); // Turn LED off
    //LED.unexport(); // Unexport LED GPIO to free resources
    process.exit(); //exit completely
});