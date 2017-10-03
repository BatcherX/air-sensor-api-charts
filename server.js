// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();

app.get('/api/', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/assets/index.html'));
});

app.get('/api/listDays/', (req, res) => {
  const dataFolder = './server/data';
  const fs = require('fs');
  const regex = /smog_(\d+-\d+-\d+).txt/;
  var days = [];
  fs.readdirSync(dataFolder).forEach(file => {
    var matchDate = file.match(regex);
    if(matchDate){
      var day = matchDate[1];
      days.push(day);
    }
  })  
  res.json(days);
  console.log("listDays: ", req.ip);
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '4343';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
