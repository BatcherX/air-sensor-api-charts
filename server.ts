// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();

const dataFolder = './server/data';

const getAllDays = () => {
  const fs = require('fs');
  const regex = /smog_(\d+-\d+-\d+).txt/;
  const days = [];
  fs.readdirSync(dataFolder).forEach(file => {
    const matchDate = file.match(regex);
    if (matchDate) {
      const day = matchDate[1];
      days.push(day);
    }
  });
  return days;
};

function pad(n) {
  return (n < 10) ? ('0' + n) : n;
}

function readMinutesFromFile(indexOfDay) {
  const file = readDayFile(indexOfDay);
  const allRows = file.toString().split(/[\r\n]+/);
  const minutes = [];
  for (let i = 0; i < allRows.length; ++i) {
    if (allRows[i].length === 0) {
      break;
    }
    const rowRegex = /^([0-9]{2} [A-Za-z]{3} [0-9]+) ([0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+)\: (.*)$/;
    const rowData = allRows[i].match(rowRegex);
    const date = rowData[1];
    const time = rowData[2];
    const measurments = rowData[3];

    const dustRegex = /^PM2\.5 (.*) mcg\/m3, PM10: (.*) mcg\/m3$/;
    const dust = measurments.match(dustRegex);
    const PM2_5 = dust[1];
    const PM10 = dust[2];

    const timestamp = Date.parse(date + ' ' + time);
    const datetime = new Date(timestamp);

    const minute = datetime.getMinutes();
    const hour = datetime.getHours();
    const second = datetime.getSeconds();

    const minuteIndex = pad(hour) + ':' + pad(minute);

    if (minutes[minuteIndex]) {
      minutes[minuteIndex].seconds.push({second: second, pm2_5: parseFloat(PM2_5), pm10: parseFloat(PM10)});
      minutes[minuteIndex].sumPM2_5 += parseFloat(PM2_5);
      minutes[minuteIndex].sumPM10 += parseFloat(PM10);
    } else {
      minutes[minuteIndex] = {
         seconds: [{second: second, pm2_5: parseFloat(PM2_5), pm10: parseFloat(PM10)}],
         sumPM2_5: parseFloat(PM2_5),
         sumPM10: parseFloat(PM10),
      };
    }
  }
  return minutes;
}

function minutesBands(divider) {
  const bands = [];
  for (let i = 0; i < 24 * 60; i += 1 ) {
    if (i % divider === 0) {
      bands[i] = [];
    }
    bands[i - i % divider].push(i);
  }
  return bands;
}

function countAverages(minutes, divider) {
  const averages = [];
  if (divider === 1) {
    for ( const key in minutes ) {
      if (key) {
        averages.push({
          minute: key,
          pm10: minutes[key].sumPM10 / minutes[key].seconds.length,
          pm2_5: minutes[key].sumPM2_5 / minutes[key].seconds.length,
          count: minutes[key].seconds.length
        });
      }
    }

  } else {
    const bands = minutesBands(divider);
    for (const bandLead in bands) {
      if (bandLead) {
        let bandPM10 = 0;
        let bandPM2_5 = 0;
        let bandCount = 0;
        let skippedMinutes = 0;
        const leadMinuteIndex = pad(( +bandLead - +bandLead % 60) / 60) + ':' + pad(+bandLead % 60);
        for (const bandMemberIndex in bands[bandLead]) {
          if (bandMemberIndex) {
            const bandMember = bands[bandLead][bandMemberIndex];
            const memberMinuteIndex = pad((bandMember - bandMember % 60) / 60) + ':' + pad(bandMember % 60);

            if (minutes[memberMinuteIndex]) {
              bandPM10 += minutes[memberMinuteIndex].sumPM10;
              bandPM2_5 += minutes[memberMinuteIndex].sumPM2_5;
              bandCount += minutes[memberMinuteIndex].seconds.length;
            } else {
              skippedMinutes += 1;
            }
          }
        }
        if (bandCount) {
          averages.push({
            minuteRange: leadMinuteIndex,
            pm10: bandPM10 / bandCount,
            pm2_5: bandPM2_5 / bandCount,
            count: bandCount,
            skippedMinutes: skippedMinutes
          });
        }
      }
    }
  }
  return averages;
}

const readDayFile = (day) => {
  const filename = dataFolder + '/smog_' + day + '.txt';
  const fs = require('fs');
  return fs.readFileSync(filename);
};

app.get('/api/', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/assets/index.html'));
});

app.get('/api/listDays/', (req, res) => {
  const days = getAllDays();
  res.json(days);
  console.log('[ OK ]', req.ip, req.url);
});

app.get('/api/:day/minutes/', (req, res) => {
  const days = getAllDays();
  const day = req.params.day;
  const index = days.indexOf(day);

  if (index === -1) {
    res.status(404).send('No such day in list!');
    console.log('[FAIL]', req.ip, req.url);
  } else {
    const indexOfDay = days[index];
    const minutes = readMinutesFromFile(indexOfDay);

    const averages = countAverages(minutes, 1);

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
  const days = getAllDays();
  const day = req.params.day;
  const index = days.indexOf(day);

  if (index === -1) {
    res.status(404).send('No such day in list!');
    console.log('[FAIL]', req.ip, req.url);
  } else {
    const indexOfDay = days[index];
    const minutes = readMinutesFromFile(indexOfDay);

    const averages = countAverages(minutes, 15);

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
  const days = getAllDays();
  const day = req.params.day;
  const index = days.indexOf(day);

  if (index === -1) {
    res.status(404).send('No such day in list!');
    console.log('[FAIL]', req.ip, req.url);
  } else {
    const indexOfDay = days[index];
    const minutes = readMinutesFromFile(indexOfDay);

    const averages = countAverages(minutes, 60);

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
