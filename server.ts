import { SmogProcessor } from './server/processors/SmogProcessor';
// Get dependencies
const Hapi = require('hapi');
const Inert = require('inert');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const server = new Hapi.Server();

server.register(Inert);
server.connection({ port: 4343, router: {stripTrailingSlash: true} });

const smogProcessor = new SmogProcessor('./server/data');

server.route({
  method: 'GET',
  path: '/api',
  handler: function (request, reply) {
    reply.file(path.join(__dirname, 'server/assets/index.html'));
  }
});

server.route({
  method: 'GET',
  path: '/api/listDays',
  handler: function (request, reply) {
    const days = smogProcessor.getAllDays();
    reply(days);
  }
});

server.route({
  method: 'GET',
  path: '/api/{day}/minutes',
  handler: function (request, reply) {
    const days = smogProcessor.getAllDays();
    const day = request.params.day;
    const index = days.indexOf(day);

    if (index === -1) {
      reply('No such day in list!').code(404);
    } else {
      const indexOfDay = days[index];
      const minutes = smogProcessor.readMinutesFromFile(indexOfDay);

      const averages = smogProcessor.countAverages(minutes, 1);

      reply({
        day: indexOfDay,
        unit: {
          pm10: 'mcg/m3',
          pm2_5: 'mcg/m3',
        },
        minuteAverages: averages,
      });
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/{day}/quarterHours',
  handler: function (request, reply) {
    const days = smogProcessor.getAllDays();
    const day = request.params.day;
    const index = days.indexOf(day);

    if (index === -1) {
      reply('No such day in list!').code(404);
    } else {
      const indexOfDay = days[index];
      const minutes = smogProcessor.readMinutesFromFile(indexOfDay);

      const averages = smogProcessor.countAverages(minutes, 15);

      reply({
        day: indexOfDay,
        unit: {
          pm10: 'mcg/m3',
          pm2_5: 'mcg/m3',
        },
        minuteAverages: averages,
      });
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/{day}/hours',
  handler: function (request, reply) {
    const days = smogProcessor.getAllDays();
    const day = request.params.day;
    const index = days.indexOf(day);

    if (index === -1) {
      reply('No such day in list!').code(404);
    } else {
      const indexOfDay = days[index];
      const minutes = smogProcessor.readMinutesFromFile(indexOfDay);

      const averages = smogProcessor.countAverages(minutes, 60);

      reply({
        day: indexOfDay,
        unit: {
          pm10: 'mcg/m3',
          pm2_5: 'mcg/m3',
        },
        minuteAverages: averages,
      });
    }
  }
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
