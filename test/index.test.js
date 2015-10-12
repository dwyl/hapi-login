var test   = require('tape');
// we display the file (name) in each test name
var dir   = __dirname.split('/')[__dirname.split('/').length-1];
var file  = dir + __filename.replace(__dirname, '') + ' -> ';

/************************ SETUP HAPI SERVER ***************************/
var Hapi   = require('hapi');  // https://github.com/nelsonic/learn-hapi
var server = new Hapi.Server({ debug: false })
server.connection({ port: 8000 });

// define which fields we want to validate for
var Joi    = require('joi');
var fields = {
  email     : Joi.string().email().required(),
  password  : Joi.string().required().min(6) // minimum length 6 characters
}
function handler (request, reply) {
  console.log(request.payload)
  reply('test passed');
}
var opts   = { fields:fields, handler:handler };

// load the plugin with the specific fields we want to validate against
server.register([{ register: require('../lib'), options:opts }], function (err) {
  if (err) { console.error('Failed to load plugin:', err); }
});

/************************* TESTS ***************************/
test(file+'Attempt to submit a registration without password', function(t){
  var options = {
    method: "POST",
    url: "/login",
    payload : { email:'this@here.net' }
  };

  server.inject(options, function(response) {
    // joi returns 400 when auth validation fails.
    var code = response.statusCode
    t.equal(code, 400, 'Register without password fails -> '+code);
    server.stop(function(){ t.end() });
  });
})

test(file+'Attempt to register with unrecognised field', function(t){
  var options = {
    method: "POST",
    url: "/login",
    payload : { email:'this@here.net', password: 'pass4567', name:'Emit' }
  };

  server.inject(options, function(response) {
    // joi returns 400 when auth validation fails.
    var code = response.statusCode
    t.equal(code, 400, 'Register with unknown field fails -> '+code);
    server.stop(function(){ t.end() });
  });
})

var person = {
  "email" : 'dwyl.test+login-payload' +Math.random()+'@gmail.com',
  "password":"EverythingIsAwesome"
}

test(file+"Successfully register with email and password", function(t) {
  var options = {
    method: "POST",
    url: "/login",
    payload : person
  };

  server.inject(options, function(response) {
    // console.log(response)
    t.equal(response.statusCode, 200, "Register worked with email and password");
    server.stop(function(){ t.end() });
  });
});
