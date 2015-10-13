var test   = require('tape');
// we display the file (name) in each test name
var dir   = __dirname.split('/')[__dirname.split('/').length-1];
var file  = dir + __filename.replace(__dirname, '') + ' -> ';

/************************ SETUP HAPI SERVER ***************************/
var Hapi   = require('hapi');  // https://github.com/nelsonic/learn-hapi
var server = new Hapi.Server(); //{ debug: {"request": ["error", "uncaught"]} });
server.connection({ port: 8000 });

var Bcrypt = require('bcrypt');

var user = {
    email: 'john@smith.net',
    password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
    name: 'John Doe ',
    id: '2133d32a'
};

// define which fields we want to validate for
var Joi    = require('joi');
var fields = {
  email     : Joi.string().email().required(),
  password  : Joi.string().required().min(5) // minimum length 6 characters
};
function handler (request, reply) {
  // db.get(request.payload.email, function(err, res) { // GENERIC DB request. insert your own here!
  //   if(err) {
  //     reply('fail').code(400);
  //   }
    Bcrypt.compare(request.payload.password, user.password, function (err, isValid) {
        if(!err && isValid) {
          reply('great success'); // or what ever you want to rply
        } else {
          reply('fail').code(400);
        }
    }); // END Bcrypt.compare which checks the password is correct
  // }); // END db.get which checks if the person is in our database
}
var opts   = { fields:fields, handler:handler };

// load the plugin with the specific fields we want to validate against
server.register([{ register: require('../lib'), options:opts }], function (err) {
  if (err) { console.error('Failed to load login plugin:', err); }
});

/************************* TESTS ***************************/
test(file+'Attempt to submit a /login request without password', function(t){
  var options = {
    method: "POST",
    url: "/login",
    payload : { email:'this@here.net' }
  };

  server.inject(options, function(response) {
    // joi returns 400 when auth validation fails.
    var code = response.statusCode;
    t.equal(code, 400, '/login without password fails -> '+code);
    server.stop(function(){ t.end(); });
  });
});

test(file+'Attempt to /login with unrecognised field', function(t){
  var options = {
    method: "POST",
    url: "/login",
    payload : { email:'this@here.net', password: 'pass4567', job:'Magician' }
  };

  server.inject(options, function(response) {
    // joi returns 400 when auth validation fails.
    var code = response.statusCode;
    t.equal(code, 400, '/login with unknown field fails -> '+code);
    server.stop(function(){ t.end(); });
  });
});

test(file+"Subit /login with incorrect password", function(t) {
  var person = {
    "email"    : 'john@smith.net',
    "password" : 'incorrect'
  };
  var options = {
    method: "POST",
    url: "/login",
    payload : person
  };

  server.inject(options, function(response) {
    t.equal(response.statusCode, 400, "/login faild when  password incorrect");
    server.stop(function(){ t.end(); });
  });
});

test(file+"Successfully /login with email and password", function(t) {
  var person = {
    "email" : 'john@smith.net',
    "password":'secret'
  };
  var options = {
    method: "POST",
    url: "/login",
    payload : person
  };

  server.inject(options, function(response) {
    // console.log(response)
    t.equal(response.statusCode, 200, "/login worked with email and password");
    server.stop(function(){ t.end(); });
  });
});
