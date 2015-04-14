/*
restify.js -- restify 
Copyright (C) 2012 Ivan Popovski
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var fs = require('fs');
var path = require('path');
var restify = require('restify');
var Component = require(__dirname).create();
var bodyParser = require('restify-plugin-json-body-parser');

var conf = require('../../config/rest.json')

function pathNormalize(url) {
  return url.replace(/\/+/g, '/');
}

function methodNormalize(method) {
  switch (method) {
    case 'DELETE':
    case 'delete':
    case 'DEL':
    case 'del':
      return 'del';
      break;
    case 'OPTIONS':
    case 'options':
    case 'OPTS':
    case 'opts':
      return 'opts';
      break;
  }

  return method.toLowerCase();
}

function ControllersRestify(opts) {
  console.log('ControllersRestify:'+JSON.stringify(opts));

  function restifyInit() {
    var server = restify.createServer();
    // server.use(restify.bodyParser());
    server.use(restify.queryParser());
    server.use(bodyParser());

    if(conf.static.serve) {
      server.get(/\/|.*\..+$/, restify.serveStatic({
        directory: './public/',
        default: 'index.html'
      }))
    }

    if(I18n && I18n.attach) {
      I18n.attach(server, I18n.opts);
    }

    server.listen(opts.port, opts.host, function() {
      console.log('%s listening at %s', server.name, server.url);
    })

    this.use = function(callback) {
      server.use(callback)
    }

    this.start = function(app) {
      for(var i = 0; i < opts.routes.length; i++) {
        console.log('RESTIFY START:'+JSON.stringify(opts.routes[i]));
        var method = methodNormalize(opts.routes[i].method);
        var action = opts.routes[i].action;
        var controller = Component.require(opts.routes[i].controller);

        app.export(controller.exportAs, controller);
        server[method] (opts.prefix + opts.routes[i].path, controller[action]);
      }
      Component.finish(app);
    }
  }

  return new restifyInit();
}

conf.routes = Component.routes;

if(!module.parent) {
  var restifyController = ControllersRestify(conf);
  restifyController.start();
} else {
  module.exports = ControllersRestify(conf);
}
