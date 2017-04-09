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





// 1  定义事件触发器
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Signal = function() {
};

util.inherits(Signal, EventEmitter);

var signal = new Signal();



signal.on('into',function(msg){
    console.log(msg);
    console.log('intointointointointointo');
})



















//房间用户名单
var roomInfo = {};



////////////////////////////////////////////////////////////////////////
socketIo.on('connection', function (socket) {

    var roomID;   // 获取房间ID
    var userName;

    /////////////////////    监听加入房间     ///////////////////////

    socket.on('join', function (obj) {


        userName = obj.userName;
        roomID = obj.roomID;

        console.log(userName+" join into room is:"+roomID);

        // 将用户昵称加入房间名单中
        if (!roomInfo[roomID]) {
            roomInfo[roomID] = [];
        }

        if(roomInfo[roomID].indexOf(userName)==-1){
            roomInfo[roomID].push(userName);
        }



        // 加入房间
        socket.join(roomID);

        // 通知房间内人员
        socketIo.to(roomID).emit('sys', userName + '加入了房间', roomInfo[roomID]);


        //收到系统指令，移除某人
        var channel = roomID+'_'+userName;

        console.log(channel);

        signal.on(channel, function(msg){

            console.log("收到移除指令："+msg);

            socket.leave(roomID);
            socketIo.to(roomID).emit('sys', userName + '被系统移出了房间:原因是:', null);

        })

    });
    /////////////////////////////////////////////////////////////////





    ////////////////////////  监听收到消息  //////////////////////////
    socket.on('message', function (msg) {

        // 验证如果用户不在房间内则不给发送
        if (roomInfo[roomID].indexOf(userName) === -1) {
            return false;
        }
        socketIo.to(roomID).emit('msg', userName, msg);
    });
    /////////////////////////////////////////////////////////////////







    /////////////////////////  监听离开房间  /////////////////////////
    socket.on('leave', function () {
        socket.emit('disconnect');
    });
    ////////////////////////////////////////////////////////////////



    /////////////////////////  断开连接  /////////////////////////

    socket.on('disconnect', function () {

        // 从房间名单中移除
        var index = roomInfo[roomID].indexOf(userName);
        if (index !== -1) {
            roomInfo[roomID].splice(index, 1);
        }


        // 退出房间
        socket.leave(roomID);
        socketIo.to(roomID).emit('sys', userName + '退出了房间', roomInfo[roomID]);

        if(roomInfo[roomID].length === 0){
            // delete roomInfo[roomID];
        }

        console.log(userName + '退出了' + roomID);


        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log(roomInfo);
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

    });

    /////////////////////////////////////////////////////////////////

})



////////////////////////////////////////////////////////////////////////
























app.get('/',function(req,res,next){
    res.render('index',{title:'chatRoom'})
});


app.get('/admin',function(req,res,next){
    res.render('admin',{title:'chatRoom'})
});

app.get('/admin/roomlist',function(req,res,next){
    res.json(roomInfo);
});

app.get('/admin/remove',function(req,res,next){

    var userName=req.query.userName;
    var  roomID= req.query.roomID;
    var msg = req.query.msg;
    var channel = roomID+'_'+userName;
    console.log(channel);
    signal.emit(channel,msg);
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
