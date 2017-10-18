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
    try {
      const result = smogProcessor.getDayInRangesJson(request.params.day, 1);
      reply(result);
    } catch (error) {
      reply(error.message).code(404);
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/{day}/quarterHours',
  handler: function (request, reply) {
    try {
      const result = smogProcessor.getDayInRangesJson(request.params.day, 15);
      reply(result);
    } catch (error) {
      reply(error.message).code(404);
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/{day}/hours',
  handler: function (request, reply) {
    try {
      const result = smogProcessor.getDayInRangesJson(request.params.day, 60);
      reply(result);
    } catch (error) {
      reply(error.message).code(404);
    }
  }
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
