# hapi-*login*

The ***simplest possible*** login via *standard* html form `POST` payload ... #***ProgressiveEnhancement***

[![Build Status](https://travis-ci.org/dwyl/hapi-login.svg)](https://travis-ci.org/dwyl/hapi-login)
[![codecov.io](http://codecov.io/github/dwyl/hapi-login/coverage.svg?branch=master)](http://codecov.io/github/dwyl/hapi-login?branch=master)
[![Code Climate](https://codeclimate.com/github/dwyl/hapi-login/badges/gpa.svg)](https://codeclimate.com/github/dwyl/hapi-login)
[![Dependency Status](https://david-dm.org/dwyl/hapi-login.svg)](https://david-dm.org/dwyl/hapi-login)
[![devDependencies Status](https://david-dm.org/dwyl/hapi-login/dev-status.svg)](https://david-dm.org/dwyl/hapi-login?type=dev)

[![HAPI 13.4.1](http://img.shields.io/badge/hapi-13.4.1-brightgreen.svg "Latest Hapi.js")](http://hapijs.com)
[![Node.js Version](https://img.shields.io/node/v/hapi-auth-jwt2.svg?style=flat "Node.js 4.x & 5.x supported")](http://nodejs.org/download/)
[![npm](https://img.shields.io/npm/v/hapi-login.svg)](https://www.npmjs.com/package/hapi-login)
[![bitHound Score](https://www.bithound.io/github/dwyl/hapi-login/badges/score.svg)](https://www.bithound.io/github/dwyl/hapi-login)
[![HitCount](https://hitt.herokuapp.com/dwyl/hapi-login.svg)](https://github.com/dwyl/hapi-login)
[![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Lead Maintainer: [Nelson](https://github.com/nelsonic)

## Why?

Login should be a ***simple seamless experience***.

![basic example](https://cloud.githubusercontent.com/assets/194400/10523082/6e7fab3c-7370-11e5-91e2-639fc725b3e6.png)

> if you need a *working* example of this, see:
https://github.com/dwyl/hapi-login-example

## What?

*Most* login forms send data to a server using the `POST` method;
some apps send data the "traditional" way while others send via "ajax"...
In Hapi this data is available in the `request.payload`.  
This *tiny* plugin simplifies setting up a "*simple*" `/login` route
which you can `POST` to using a form in your hapi.js based app/api.



## How?

> We have *tried* to make this as ***simple as possible***,
but if you have ***any questions***,  
[***please ask***](https://github.com/dwyl/hapi-login/issues)
and/or [![Join the chat at https://gitter.im/dwyl/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dwyl/chat/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



### 1. Install from NPM

*First* install the `hapi-login` plugin from `npm` and save as a *dependency*:  
( You will *also* need [***Joi***](https://github.com/hapijs/joi) to
specify the required *fields* for loging in, e.g: email and password
and [***bcrypt***](https://www.npmjs.com/package/bcrypt) to
***securely hash passwords*** *before storing them in a database* )


```js
npm install hapi-login joi bcrypt --save
```

### 2. Specify the fields required for login

*most* login forms will require an email
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
( *as always, if you have any questions*, [***please ask***](https://github.com/dwyl/hapi-login/issues) )

### 3. Define your custom handler function

Define your handler function with the following signature:

- `handler` - (*required*) a user lookup and password validation function with the signature `function(request, reply)` where:
    - `request`  - is the hapi request object of the request which is being authenticated.
    - `reply`    - the hapi reply object used to send the response to the client when login succeeds (*or fails*).

#### Example `handler` function:

```js
var Bcrypt = require('bcrypt'); // use bcrypt to hash passwords.
var db     = require('your-favourite-database'); // your choice of DB
var Boom   = require('boom') //

function handler (request, reply) {
  db.get(request.payload.email, function(err, res) { // GENERIC DB request. insert your own here!
    if(err) {
      reply('fail').code(400); // don't leak info about user existence
    }
    Bcrypt.compare(request.payload.password, user.password, function (err, isValid) {
        if(!err && isValid) {
          reply('great success'); // or what ever you want to rply
        } else {
          reply(Boom.notFound('Sorry, that username or password is invalid, please try again.'));
        } // see: https://github.com/dwyl/hapi-login/issues/14
    }); // END Bcrypt.compare which checks the password is correct
  }); // END db.get which checks if the person is in our database
}
```
> Note: You can store this handler function in a *separate file*
and `require` it into your app.

> Note: if you want to send a people-friendly error message (*page*) check out:
> https://github.com/dwyl/hapi-error

##### Custom Login Path
- `loginPath` - (*optional*) an optional login path String, defaults to `/login` but can assigned any valid path.

add it to your options object:

```js
var options = {
  fields: fields,
  handler: handler,
  loginPath: "/api/login"
}
```

### 4. Boot your Hapi.js Server with the Plugin

```js
var Hapi   = require('hapi'); // https://github.com/nelsonic/learn-hapi
var server = new Hapi.Server({ debug: false })
server.connection({ port: 8000 });

// define the options you are going to pass in when registering your plugin
var opts = { fields:fields, handler:handler, loginPath:loginPath }; // the fields and handler defined above

server.register([{ register: require('hapi-login'), options:opts }], function (err) {
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
[***please tell us***](https://github.com/dwyl/hapi-login/issues)!
