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

const getDayInRangesJson = function (day, range, next) {
  try {
    const result = smogProcessor.getDayInRangesJson(day, range);
    next(null, result);
  } catch (error) {
    next(error);
  }
};

server.method(
  'getDayInRangesJson',
  getDayInRangesJson,
  {
    cache: {
      expiresIn: 15 * 1000,
      generateTimeout: 4000,
      staleIn: 5 * 1000,
      staleTimeout: 2000
    }
  }
);

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
    server.methods.getDayInRangesJson(request.params.day, 1, function(err, res){
      if (err) {
        reply(err.message).code(404);
      } else {
        reply(res);
      }
    });
  }
});

server.route({
  method: 'GET',
  path: '/api/{day}/quarterHours',
  handler: function (request, reply) {
    server.methods.getDayInRangesJson(request.params.day, 15, function(err, res){
      if (err) {
        reply(err.message).code(404);
      } else {
        reply(res);
      }
    });
  }
});

server.route({
  method: 'GET',
  path: '/api/{day}/hours',
  handler: function (request, reply) {
    server.methods.getDayInRangesJson(request.params.day, 60, function(err, res){
      if (err) {
        reply(err.message).code(404);
      } else {
        reply(res);
      }
    });
  }
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});
