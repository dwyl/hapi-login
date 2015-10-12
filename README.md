# hapi-login-*payload*

Login via `POST` payload values
submitted by a *standard* html form - ***progressive enhancement***.

[![Build Status](https://travis-ci.org/nelsonic/hapi-auth-payload.svg)](https://travis-ci.org/nelsonic/hapi-auth-payload)
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

Login should be simple.

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

First install the `hapi-register` plugin
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

### 3. Define

- `validateFunc` - (*required*) a user lookup and password validation function with the signature `function(request, email, password, callback)` where:
    - `request`  - is the hapi request object of the request which is being authenticated.
    - `email`    - the email address received from the client.
    - `password` - the password received from the client.
    - `callback` - a callback function with the signature `function(err, isValid, credentials)` where:
        - `err` - an internal error.
        - `isValid` - `true` if both the username was found and the password matched, otherwise `false`.
        - `credentials` - a credentials object passed back to the application in `request.auth.credentials`. Typically, `credentials` are only
          included when `isValid` is `true`, but there are cases when the application needs to know who tried to authenticate even when it fails
          (e.g. with authentication mode `'try'`).

```js
var Bcrypt = require('bcrypt');

var user = {
    email: 'john@smith.net',
    password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
    name: 'John Doe ',
    id: '2133d32a'
};

var validate = function (request, email, password, callback) {

    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, function (err, isValid) {

        callback(err, isValid, { id: user.id, name: user.name });
    });
};

server.register(require('hapi-auth-payload'), function (err) {

    server.auth.strategy('simple', 'basic', { validateFunc: validate });
    server.route({ method: 'GET', path: '/', config: { auth: 'simple' } });
});
```








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
