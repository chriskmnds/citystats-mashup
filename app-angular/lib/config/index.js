var nconf = require('nconf');
var fs = require('fs');
var strings = require('../strings');

//var config = nconf.env({separator: '__'}).file((__dirname + '/config.json'));

exports.configModule = function(pkg) {
  var appConfig = fs.readFileSync(__dirname + '/config_module.js', 'utf8');
  appConfig = strings.replace(appConfig, [
    {key: '%NODE_API_BASE_URL%', value: pkg.configs.node_api_base_url},
    {key: '%APP_TITLE%', value: pkg.configs.app_title},
    {key: '%APP_VERSION%', value: pkg.version},
  ]);
  return appConfig;
}

/*exports.send = function(req, res) {
  if (cg.stale(req, res, lastModified)) {
    res.header('Content-Type', 'application/javascript; charset=utf-8');
    res.send(appConfig);
  }
};*/