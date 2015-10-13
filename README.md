# hapi-login-*payload*

The ***simplest possible*** login via *standard* html form `POST` payload ... #***ProgressiveEnhancement*** #**LookMaNoAjax**

[![Build Status](https://travis-ci.org/nelsonic/hapi-login-payload.svg)](https://travis-ci.org/nelsonic/hapi-login-payload)
[![codecov.io](http://codecov.io/github/nelsonic/hapi-login-payload/coverage.svg?branch=master)](http://codecov.io/github/nelsonic/hapi-login-payload?branch=master)
[![Code Climate](https://codeclimate.com/github/nelsonic/hapi-login-payload/badges/gpa.svg)](https://codeclimate.com/github/nelsonic/hapi-login-payload)
[![Dependency Status](https://david-dm.org/nelsonic/hapi-login-payload.svg)](https://david-dm.org/nelsonic/hapi-login-payload)
[![devDependency Status](https://david-dm.org/nelsonic/hapi-login-payload/dev-status.svg)](https://david-dm.org/nelsonic/hapi-login-payload#info=devDependencies)

[![HAPI 10.4.1](http://img.shields.io/badge/hapi-10.4.1-brightgreen.svg "Latest Hapi.js")](http://hapijs.com)
[![Node.js Version](https://img.shields.io/node/v/hapi-auth-jwt2.svg?style=flat "Node.js 0.12 & 4.0 and io.js latest all supported")](http://nodejs.org/download/)
[![npm](https://img.shields.io/npm/v/hapi-login-payload.svg)](https://www.npmjs.com/package/hapi-login-payload)
[![bitHound Score](https://www.bithound.io/github/nelsonic/hapi-login-payload/badges/score.svg)](https://www.bithound.io/github/nelsonic/hapi-login-payload)
[![HitCount](https://hitt.herokuapp.com/nelsonic/hapi-login-payload.svg)](https://github.com/dwyl/hapi-login-payload)
[![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Lead Maintainer: [Nelson](https://github.com/nelsonic)

## Why?

Login should be a ***simple seamless experience***.

## What?

*Most* login forms send data to a server using the `POST` method;
some apps send data the "traditional" way while others send via "ajax"...
In Hapi this data is available in the `request.payload`.  
This *tiny* plugin simplifies setting up a "*simple*" `/login` route
which you can `POST` to using a form in your hapi.js based app/api.



## How?

> We have *tried* to make this as ***simple as possible***,
but if you have ***any questions***,  
[***please ask***](https://github.com/nelsonic/hapi-login-payload/issues)
and/or [![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)




### 1. Install from NPM

First install the `hapi-login-payload` plugin
(*and* [***Joi***](https://github.com/hapijs/joi))
from `npm` and save as a *dependency*:

```js
npm install hapi-login-payload joi --save
```

### 2. Specify the fields required for login

In general *most* login forms will require an email
address and a password:

```js
var Joi = require('joi');
var custom_fields = {
  email     : Joi.string().email().required(), // Required
  password  : Joi.string().required().min(6)   // minimum length 6 characters
}
```

> Note: If you want/need to define any additional/cusotm fields,
simply add them to your `fields` object.  
(*as always, if you have any questions, ask!*)

### 3. Define your custom handler function

Define your handler function with the following signature:

- `handler` - (*required*) a user lookup and password validation function with the signature `function(request, reply)` where:
    - `request`  - is the hapi request object of the request which is being authenticated.
    - `reply`    - the hapi reply object used to send the response to the client when login succeeds (*or fails*).

#### Example `handler` function:

```js
var Bcrypt = require('bcrypt'); // use bcrypt to hash passwords.
var db     = require('your-favourite-database'); // your choice of DB

function handler (request, reply) {
  db.get(request.payload.email, function(err, res) { // GENERIC DB request. insert your own here!
    if(err) {
      reply('fail').code(400); // don't leak info about user existence
    }
    Bcrypt.compare(request.payload.password, user.password, function (err, isValid) {
        if(!err && isValid) {
          reply('great success'); // or what ever you want to rply
        } else {
          reply('fail').code(400);
        }
    }); // END Bcrypt.compare which checks the password is correct
  }); // END db.get which checks if the person is in our database
}
```
> Note: You can store this function in a separate file
and `require` it into your app.

### 4. Boot your Hapi.js Server with the Plugin

```js
var Hapi   = require('hapi'); https://github.com/nelsonic/learn-hapi
var server = new Hapi.Server({ debug: false })
server.connection({ port: 8000 });

// define the options you are going to pass in when registering your plugin
var opts = { fields:fields, handler:handler }; // the fields and handler defined above

server.register([{ register: require('hapi-login-payload'), options:opts }], function (err) {
  if (err) { console.error('Failed to load plugin:', err); }
});

server.start(function() {
  console.log('Now Visit: http://127.0.0.1:'+server.info.port);
});
```

That's it.

### Want more?

> What is a fail_action_handler ?




## Frequently Asked Questions

**Q**: What are the advantages of authenticating using the payload rather than request header?
see: [#1](https://github.com/nelsonic/hapi-auth-payload/issues/1)  
**A**: it makes writing apps simpler. instead of having perform the 4 steps
listed in the Notes section (*below*)  
this plugin lets apps use
a *simple* - *progressive enhancement* - approach:
a *basic* html form.

## Notes:

We [*were*](https://github.com/dwyl/time/blob/17c5e830afffd558375a4c20814d8320d6ad4c9f/api/test/login.js#L31) using
[*hapi-auth*-***basic***](https://github.com/hapijs/hapi-auth-basic)
for our projects, while there's *nothing* "*wrong*" with that plugin,  
we feel there is *one too many steps* involved.
*Specifically*:
*hapi-auth*-***basic*** requires the username  
and password be sent
in the `request.header` as a Base64-encoded string.

There are ***four*** steps involved in preparing the auth
request to *hapi-auth*-***basic***:
1. Get values for `username` and `password` from the form.
2. [Encode](https://github.com/hapijs/hapi-auth-basic/blob/3bb813018819bf21f05f01a1db2b158db2878bfc/test/index.js#L746) the values as Base64:
```js
var header = "Basic " + (new Buffer(email + ':' + password, 'utf8')).toString('base64');
```
3. Attach the auth header to the request you are about to send to the Server
4. Send the `POST` request to the server.

We thought this was *too many* steps and not very beginner-friendly.  
So we removed the first 3 steps and use a simple html form with a `POST` action.

> if you know (*or can think of*) a ***simpler*** way of doing this,
[***please tell us***]()!
