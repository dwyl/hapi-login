var test   = require('tape');
// we display the file (name) in each test name
var dir   = __dirname.split('/')[__dirname.split('/').length-1];
var file  = dir + __filename.replace(__dirname, '') + ' -> ';

/************************ SETUP HAPI SERVER ***************************/
var Hapi   = require('hapi');     // https://github.com/nelsonic/learn-hapi
var server1 = new Hapi.Server({ debug: false });
server1.connection({ port: 8000 });

// load the plugin
server1.register([{ register: require('../lib') }], function (error) {
  if (error) { console.error('Forgot to load options with plugin:', error); }
});

/************************* TESTS ***************************/
test(file+"No fields defined - expect 404 (i.e. no /login route!)", function(t) {
  var options = {
    method: "POST",
    url: "/login",
    payload : { email: 'invalidemail' } // no tld
  };

  server1.inject(options, function(response) {
    t.equal(response.statusCode, 404, "/login not found (as expected)");
    server1.stop(function(){ t.end(); });
  });
});

/************************* SERVER TWO **********************/

var server2 = new Hapi.Server({ debug: false });
server2.connection({ port: 8000 });

var Joi = require('joi');
var custom_fields = {
  email : Joi.string().email().required()
};
var opts = { fields: custom_fields };

// load the plugin
server2.register([{ register: require('../lib'), options : opts  }], function (err) {
  if (err) { console.error('Failed to load plugin:', err); }
});

/************************* TESTS ***************************/
test(file+"No handler - expect 404 (i.e. no /login route!)", function(t) {
  var options = {
    method: "POST",
    url: "/login",
    payload : { email: 'invalidemail' } // no tld
  };

  server2.inject(options, function(response) {
    t.equal(response.statusCode, 404, "/login not found (as expected)");
    server2.stop(function(){ t.end(); });
  });
});
