/**
 * Created by dashan on 2017/4/7.
 */

var express = require('express');
var path = require('path');
var io = require('socket.io');
var router = express.Router();
var config = require('./config');

var app = express();

var server = require('http').createServer(app);


app.use(express.static(path.join(__dirname,'public')));

//设置模板引擎
var ejs = require('ejs');
app.engine('html',ejs.__express);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','html');

//创建socket 服务
var socketIo = io(server);

//房间用户名单
var roomInfo = {};



////////////////////////////////////////////////////////////////////////
socketIo.on('connection', function (socket) {

    socket.on('join', function (obj) {

        console.log(obj);

        var userName = obj.userName;
        var roomID = obj.roomID;


        console.log("join:"+userName);


        // 将用户昵称加入房间名单中
        if (!roomInfo[roomID]) {
            roomInfo[roomID] = [];
        }
        roomInfo[roomID].push(userName);

        socket.join(roomID);    // 加入房间


        // 通知房间内人员
        socketIo.to(roomID).emit('sys', userName + '加入了房间', roomInfo[roomID]);


        console.log(userName + '加入了' + roomID);
    });

})



////////////////////////////////////////////////////////////////////////
























app.get('/',function(req,res,next){
    res.render('index',{title:'chatRoom'})
});



app.get('/enter',function(req,res,next){

    res.render('main',{title:'main',
                        roomID:req.query.roomID,
                        username:req.query.username,
                        users:roomInfo[req.query.roomID]
                        });

});


server.listen(config.port,function(){
    console.log("server listening on port %d",config.port);
});
