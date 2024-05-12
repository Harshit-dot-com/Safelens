require('dotenv').config();

const express = require('express');
const app = express();

var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/video-call-app');

app.listen(3000, ()=>{
    console.log('Server is running');
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static('public'));

const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

var webSocketServ = require('ws').Server;

var wss = new webSocketServ({
    port:8000
});
function sentToOtherUser(connection, message){
    connection.send(JSON.stringify(message));
}
var users = {};
wss.on("connection",function(conn){
    console.log('user connected');
    conn.on("message",function(message){
        var data;

        try{
            data = JSON.parse(message);
        }
        catch(e){
            console.log(e);
        }
        switch(data.type){
            case "online":
                users[data.name] = conn;
                conn.name = data.name;

                sentToOtherUser(conn,{
                    type: "online",
                    success:true
                })
            break;
            case "offer":
                var connect = users[data.name];
                if(connect!=null){
                    conn.otherUser = data.name;
                    console.log(data.offer);
                    sentToOtherUser(connect,{
                        type: "offer",
                        offer: data.offer,
                        name: conn.name,
                        image : data.image
                    });
                }
                else{
                    sentToOtherUser(conn,{
                        type: "not_available",
                        name: data.name,
                    });
                }
            break;
            case "answer":
                var connect = users[data.name];
                if(connect!=null){
                    conn.otherUser = data.name;
                    console.log(data.answer);
                    sentToOtherUser(connect,{
                        type: "answer",
                        answer: data.answer
                    });
                }
            break;
            case "candidate":
                var connect = users[data.name];
                if(connect!=null){
                    console.log(data.candidate);
                    sentToOtherUser(connect,{
                        type: "candidate",
                        candidate: data.candidate
                    });
                }
            break;
            case "reject":
                var connect = users[data.name];
                if(connect!=null){
                    sentToOtherUser(connect,{
                        type: "reject",
                        candidate: conn.name
                    });
                }
            break;
            case "accept":
                var connect = users[data.name];
                if(connect!=null){
                    sentToOtherUser(connect,{
                        type: "accept",
                        candidate: conn.name
                    });
                }
            break;
            case "leave":
                var connect = users[data.name];
                connect.otherUser = null;
                if(connect!=null){
                    sentToOtherUser(connect,{
                        type: "leave",
                    });
                }
            break;
            case "screen":
                var connect = users[data.name];
                if(connect!=null){
                    sentToOtherUser(connect,{
                        type: "screen",
                        candidate: data.candidate
                    });
                }
            break;
            case "screen":
                var connect = users[data.name];
                if (connect != null && connect.otherUser != null) {
                    // Forward the screen sharing stream to the other user
                    var otherUserConn = users[connect.otherUser];
                    if (otherUserConn != null) {
                        sentToOtherUser(otherUserConn, {
                            type: "screen",
                            screenStream: data.screenStream
                        });
                    }
                }
                break;
            default:
                sentToOtherUser(connect,{
                    type: "error",
                    message: data.type
                });

        }

    });

    conn.on("close",function(message){
        console.log("connection closed");
    });

});

