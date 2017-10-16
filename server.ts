import { SmogProcessor } from './server/processors/SmogProcessor';
// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();

const smogProcessor = new SmogProcessor('./server/data');

app.get('/api/', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/assets/index.html'));
});

app.get('/api/listDays/', (req, res) => {
  const days = smogProcessor.getAllDays();
  res.json(days);
  console.log('[ OK ]', req.ip, req.url);
});

app.get('/api/:day/minutes/', (req, res) => {
  const days = smogProcessor.getAllDays();
  const day = req.params.day;
  const index = days.indexOf(day);

  if (index === -1) {
    res.status(404).send('No such day in list!');
    console.log('[FAIL]', req.ip, req.url);
  } else {
    const indexOfDay = days[index];
    const minutes = smogProcessor.readMinutesFromFile(indexOfDay);

    const averages = smogProcessor.countAverages(minutes, 1);

    res.send({
      day: indexOfDay,
      unit: {
        pm10: 'mcg/m3',
        pm2_5: 'mcg/m3',
      },
      minuteAverages: averages,
    });
    console.log('[ OK ]', req.ip, req.url );
  }
});

app.get('/api/:day/quarterHours/', (req, res) => {
  const days = smogProcessor.getAllDays();
  const day = req.params.day;
  const index = days.indexOf(day);

  if (index === -1) {
    res.status(404).send('No such day in list!');
    console.log('[FAIL]', req.ip, req.url);
  } else {
    const indexOfDay = days[index];
    const minutes = smogProcessor.readMinutesFromFile(indexOfDay);

    const averages = smogProcessor.countAverages(minutes, 15);

    res.send({
      day: indexOfDay,
      unit: {
        pm10: 'mcg/m3',
        pm2_5: 'mcg/m3',
      },
      minuteAverages: averages,
    });
    console.log('[ OK ]', req.ip, req.url );
  }
});

app.get('/api/:day/hours/', (req, res) => {
  const days = smogProcessor.getAllDays();
  const day = req.params.day;
  const index = days.indexOf(day);

  if (index === -1) {
    res.status(404).send('No such day in list!');
    console.log('[FAIL]', req.ip, req.url);
  } else {
    const indexOfDay = days[index];
    const minutes = smogProcessor.readMinutesFromFile(indexOfDay);

    const averages = smogProcessor.countAverages(minutes, 60);

    res.send({
      day: indexOfDay,
      unit: {
        pm10: 'mcg/m3',
        pm2_5: 'mcg/m3',
      },
      minuteAverages: averages,
    });
    console.log('[ OK ]', req.ip, req.url );
  }
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
