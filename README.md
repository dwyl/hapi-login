# hapi-login-*payload*

Login via `POST` payload values
submitted by a *standard* html form - ***progressive enhancement***.

[![Build Status](https://travis-ci.org/nelsonic/hapi-auth-payload.svg)](https://travis-ci.org/nelsonic/hapi-auth-payload)
[![codecov.io](http://codecov.io/github/nelsonic/hapi-login-payload/coverage.svg?branch=master)](http://codecov.io/github/nelsonic/hapi-login-payload?branch=master)
[![Code Climate](https://codeclimate.com/github/nelsonic/hapi-login-payload/badges/gpa.svg)](https://codeclimate.com/github/nelsonic/hapi-login-payload)
[![Dependency Status](https://david-dm.org/nelsonic/hapi-login-payload.svg)](https://david-dm.org/nelsonic/hapi-login-payload)
[![devDependency Status](https://david-dm.org/nelsonic/hapi-login-payload/dev-status.svg)](https://david-dm.org/nelsonic/hapi-login-payload#info=devDependencies)

Lead Maintainer: [Nelson](https://github.com/nelsonic)

## Why?

Login should be simple.

## What?

*Most* login forms send data to a server using the `POST` method.
In Hapi this data is available in the `request.payload`.  
This *tiny* plugin simplifies setting up a "*simple*" `/login` route
which you can `POST` to using a form in your hapi.js based app/api.




Payload-based authentication requires validating an email and password combination.
The `'payload'` scheme takes the following options:

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
- `allowEmptyUsername` - (optional) if `true`, allows making requests with an empty username. Defaults to `false`.

```javascript
var Bcrypt = require('bcrypt');

var users = {
    john: {
        email: 'john@smith.net',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe ',
        id: '2133d32a'
    }
};

var validate = function (request, email, password, callback) {

    var user = users['john'];
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
