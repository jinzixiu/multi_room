/**
 * Created by dashan on 2017/4/7.
 */


var socket = require('socket.io-client')('http://localhost:3000/');

// socket.on('connect', function(){
//     console.log("connect!!!!");
// });

// console.log(socket);
// socket.emit('connect','sdfsdfsdfsfsfs');

socket.on('1212', function(data){
    console.log(data);
});

socket.on('disconnect', function(){
});