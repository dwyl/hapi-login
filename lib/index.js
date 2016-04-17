/**
 * hapi-login-payload creates a /login POST route/endpoint
 */
exports.register = function (server, options, next) {
  // console.log(server.info)
  var msg; // only set if there's an error to report
  if(options && !options.fields) {
    msg = 'Please define required/optional fields see: http://git.io/vctLR';
    console.error(msg); // we need required feild
    return next(msg);
  }
  if(options && !options.handler) {
    msg = 'Please specify a /login handler. see: http://git.io/vctLR';
    console.error(msg); // this is not going to work ...
    return next(msg);
  }
  // expose /register route for any app that includes this plugin
  server.route({
      method: '*',
      path: options.loginPath || '/login',
      config: {
        auth: false,
        validate: {
          payload : options.fields,
          failAction: options.fail_action_handler || 'error'
        }
      },
      handler: options.handler
  });

  next(); // everything worked, continue booting the hapi server!
};

exports.register.attributes = {
    pkg: require('../package.json')
};
