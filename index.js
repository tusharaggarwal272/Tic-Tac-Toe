const express=require('express');
const app=express();
const http=require('http');
const server=http.createServer(app);
const socketio=require('socket.io');
const io=socketio(server);
const path=require('path');

// app.use(express.static(__dirname)+'public');
app.use(express.static(__dirname));
var squares=["","","","","","","","",""];

var currentPlayer='X';

var totalplayers=0;
var playersactive=0;

var users=[];
var member=[];

io.on('connection',function(socket){
    var role;
    if(!getRoleOfUser("role","X")){
        role="X";
    }
    else if(!getRoleOfUser("role","O")){
        role="O";
    }
    else{
        role="Watching";
    }




    users.push({
        socketId:socket.id,
        role:role,
        userId:++totalplayers
    });

    socket.on('login',(data)=>{
        member[socket.id]=data.username
    })

    playersactive++;

    io.emit("activeUserCount",playersactive);
    socket.emit("connected",{
        currentPlayer:member[socket.id],
        squares:squares,
        role:role
    });
    socket.on("disconnect",function(){
        removeUser(socket.id);
        playersactive--;
        io.emit("activeUserCount",playersactive);
    });
    socket.on("reset", function() {
        squares = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        io.emit("reset");
      });

      socket.on("move", function(data) {
        if (getRoleOfUser("socketId", socket.id).role !== currentPlayer) {
          return;
        }
    
        squares[data.squareId] = data.player;
        io.emit("move", data);
    
        if (WinConditions(currentPlayer)) {
          io.emit("winner", currentPlayer);
          return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        io.emit("changePlayer", currentPlayer);
      });


    
});


function getRoleOfUser(key,value){
    for(var i=0;i<users.length;i++){
        if(users[i][key]===value){
            return users[i];
        }
        
    }
    return null;
}

function removeUser(socketId){
    for (var i = 0; i < users.length; i++) {
        if (users[i].socketId === socketId) {
          users.splice(i, 1);
          return;
        }
      }
}
server.listen(process.env.PORT || 5050, () => {
 
    console.log('server is running at port 5050');
});


function WinConditions(gameplayer){
    var result = false;
    if (
      tictactoedone(1, 2, 3, gameplayer) ||
      tictactoedone(4, 5, 6, gameplayer) ||
      tictactoedone(7, 8, 9, gameplayer) ||
      tictactoedone(1, 4, 7, gameplayer) ||
      tictactoedone(2, 5, 8, gameplayer) ||
      tictactoedone(3, 6, 9, gameplayer) ||
      tictactoedone(1, 5, 9, gameplayer) ||
      tictactoedone(3, 5, 7, gameplayer)
    ) {
      result = true;
    }
    return result;
}
function tictactoedone(pos1, pos2, pos3, gameplayer) {
    var result = false;
  
    if (
      sqaurevalueatpos(pos1) == gameplayer &&
      sqaurevalueatpos(pos2) == gameplayer &&
      sqaurevalueatpos(pos3) == gameplayer
    ) {
      result = true;
    }
    return result;
  }

  function sqaurevalueatpos(number) {
    return squares[number - 1];
  }