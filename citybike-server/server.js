const express = require("express");
const axios = require("axios");
const http = require("http");
const socketIo = require("socket.io");
const citybikeurl = "http://api.citybik.es/v2/networks/decobike-miami-beach?fields=stations"



const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();


app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!
let interval;

io.on("connection", socket => {
  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  console.log('New connection ' + socketId + ' from ' + clientIp);
  // clear interval from old connections
   if (interval) {
    clearInterval(interval);
  }

  // every second get data from api and emit response
  interval = setInterval( () => getApiAndEmit(socket), 1000);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit =  (socket) => {
  
  axios.get(citybikeurl)
  .then(response => {
      let data = response.data.network.stations;
      socket.emit('FromAPI', data );
  })
  .catch(error => {
    console.log(error);
  }); 
};


server.listen(port, () => console.log(`Listening on port ${port}`));



