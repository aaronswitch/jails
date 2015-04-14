module.exports = function() {
  this.index = function(req, res, next) {
    console.log('index: ' + JSON.stringify(req.params));
    res.send({});
    return next();
  }

  this.create = function(req, res, next) {
    console.log('create: ' + JSON.stringify(req.params));
    res.send({});
    return next();
  }
}
