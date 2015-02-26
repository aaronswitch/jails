var path = require('path');
var fs = require('fs');
var dir = 'app/controllers/';

function requireRoutes(file) {
  var conf = require(file || path.resolve('config/routes.json'));
  var routes = [];

  for(var i in conf.routes) {
    var route = i.split(' ');
      
    routes.push({
      method: route[0],
      path: route[1],
      controller: conf.routes[i].controller,
      action: conf.routes[i].action,
    })
  }

  console.log('ROUTES:'+JSON.stringify(routes));
  return routes;
}

var cache = {};

function requireController(name) {
  console.log('requireController:' + path.resolve('app/controllers/' + name));

  if(!cache[name]) {
    cache[name] = new (require(path.resolve(dir + name))) ();
  }
  return cache[name];
}

module.exports = function(opts) {
  opts = opts || {};
  this.routes = requireRoutes(opts.conf);
  this.require = requireController;

  this.finish = function(app) {
    var files = fs.readdirSync(dir);

    files.forEach(function(file) {
      if(file[0] === '.') {
        return true;
      }
      var suffix = path.extname(file);

      if(suffix === '.js') {
        var name = path.basename(file, suffix);

        if(!cache[name]) {
          cache[name] = new (require(path.resolve(dir + name))) ();

          if(cache[name].exportAs) {
            app.export(cache[name].exportAs, cache[name]);
          }
        }
      }
    })
  }
}

module.exports.create = function(opts) {
  console.log('CONTROLLER CREATE:'+JSON.stringify(opts));
  return new this(opts);
}
