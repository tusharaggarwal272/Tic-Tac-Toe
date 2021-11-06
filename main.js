var socket = io();
var currentPlayer = null;
var activeUserCount = 0;
var gameActive = false;
var count=0;
let name="";







$('.containerbox').hide();

$('#login-btn').click(()=>{
  count++;
    socket.emit('login',{
        username:$('#user').val()
    });
    name=$('#user').val();
    $('#user').val("");
    $('.login').hide();
    $('.containerbox').show();
    if(count){
      $('#hello-lst').text("Hello "+name);
      // console.log($('#hello-lst').text());
    }
})



// set player,board, info text and role from server values
socket.on("connected", function(data) {
  currentPlayer = data.currentPlayer;

  var playername=$('#hello-lst').text();
  console.log(playername);
  for (var i = 0; i < data.squares.length; i++) {
    setSquare(i, data.squares[i]);
  }
  if (currentPlayer) {
    setText(`It is player ${currentPlayer}'s turn.`);
  }
  document.getElementById("role").textContent = "You are player "+data.role+".";
});

// reset, check active state and update text
socket.on("reset", function(data) {
  if (activeUserCount > 1) {
    gameActive = true;
  }
  currentPlayer = data.currentPlayer;
  for (var i = 0; i < 9; i++) {
    setSquare(i, "");
  }
  setText(currentPlayer + " gets to start.");
});

// update state
socket.on("state", function(state) {
  for (var i = 0; i < 9; i++) {
    setSquare(i, state[i]);
  }
});

// update game state and text based on user count
socket.on("activeUserCount", function(newActiveUserCount) {
  activeUserCount = newActiveUserCount;
  var msg;
  if (activeUserCount < 2) {
    gameActive = false;
    msg = `Waiting for all players to connect. Only ${activeUserCount} user online.`;
  } else {
    gameActive = true;
    msg = `There are ${activeUserCount} users online.`;
  }
  document.getElementById("activeUserCount").textContent = msg;
});

// update square based on move
socket.on("move", function(data) {
  setSquare(data.squareId, data.player);
});

// change currentPlayer and update player text
socket.on("changePlayer", function(newCurrentPlayer) {
  currentPlayer = newCurrentPlayer;
  setText(`It is player ${currentPlayer}'s turn.`);
});

// declare winner
socket.on("winner", function(winner) {
  gameActive = false;
  setText(`Congratulations ${winner}, you win!`);
});

// set text
function setText(text) {
  document.getElementById("message").textContent = text;
}

// set square by index and value
function setSquare(index, value) {
  document.getElementById(index).textContent = value;
}

function move(event) {
  // check if game is active
  if (!gameActive) return;

  var square = event.target;
  // check if square is empty
  if (square.textContent === "") {
    // send currentPlayer and squareId to server
    socket.emit("move", {
      player: currentPlayer,
      squareId: square.id
    });
  }
}

// add event listener to squares
var squares = document.getElementsByClassName("square");
for (var i = 0; i < squares.length; i++) {
  squares[i].addEventListener("click", move);
}

// add event listener for reset button
document.getElementById("reset").addEventListener("click", function() {
  socket.emit("reset");
});