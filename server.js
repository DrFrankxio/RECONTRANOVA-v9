const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})
app.use(express.static('public'));

players={}

io.on('connect', (socket) => {
  socket.id = Math.random();
  players[socket.id] = {
    socket: socket.id,
    x: 10**5+25,
    z: 10**5+25,
    walkSpeed: 0.1,
    pressingRight: false,
    pressingLeft: false,
    pressingUp: false,
    pressingDown: false
  };

  socket.on('angle', (e) => {
    players[socket.id].xa = e.x;
    players[socket.id].ya = e.y;
  });

  socket.on('keyPress', function (data) {
    if (data.inputId === 'left') players[socket.id].pressingLeft = data.state;
    else if (data.inputId === 'right') players[socket.id].pressingRight = data.state;
    else if (data.inputId === 'up') players[socket.id].pressingUp = data.state;
    else if (data.inputId === 'down') players[socket.id].pressingDown = data.state;
  });

  // Mover al jugador basándote en el estado de las teclas presionadas
  setInterval(() => {
    if(
      (
        players[socket.id].x%50<5
        ||
        players[socket.id].x%50>45
      )
      &&
      (
        players[socket.id].z%50<5
        ||
        players[socket.id].z%50>45
      )
    ){
      if(players[socket.id].x%50<5){players[socket.id].x+=0.1}
      if(players[socket.id].z%50<5){players[socket.id].z+=0.1}
      if(players[socket.id].x%50>45){players[socket.id].x-=0.1}
      if(players[socket.id].z%50>45){players[socket.id].z-=0.1}
    }
    if(players[socket.id].pressingLeft){
      players[socket.id].x+=players[socket.id].walkSpeed*Math.cos(players[socket.id].xa)
      players[socket.id].z-=players[socket.id].walkSpeed*Math.sin(players[socket.id].xa)
    }
    if(players[socket.id].pressingUp){
      players[socket.id].x+=players[socket.id].walkSpeed*Math.sin(players[socket.id].xa)
      players[socket.id].z+=players[socket.id].walkSpeed*Math.cos(players[socket.id].xa)
    }
    if(players[socket.id].pressingRight){
      players[socket.id].x-=players[socket.id].walkSpeed*Math.cos(players[socket.id].xa)
      players[socket.id].z+=players[socket.id].walkSpeed*Math.sin(players[socket.id].xa)
    }
    if(players[socket.id].pressingDown){
      players[socket.id].x-=players[socket.id].walkSpeed*Math.sin(players[socket.id].xa)
      players[socket.id].z-=players[socket.id].walkSpeed*Math.cos(players[socket.id].xa)
    }
    socket.emit('pack', { x: players[socket.id].x, z: players[socket.id].z });
    socket.emit('all', { all: players });
  }, 1000 / 60); // 60 FPS
});

server.listen(8000, () => {
  console.log(`Servidor escuchando en el puerto 8000.`);
});