// Dependencies
var Promise = require('promise');
var config = require('./config');
var routes = require('./../routes/routes');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

/***********
 * Logger
 * 
 */

const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: {
    service: "billing-service",
  },
  transports: [new winston.transports.Console({})],
});

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   defaultMeta: { service: 'user-service' },
//   transports: [
//     //
//     // - Write all logs with importance level of `error` or less to `error.log`
//     // - Write all logs with importance level of `info` or less to `combined.log`
//     //
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'combined.log' }),
//   ],
// });

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}


/********* */



var initApp = function() {
  // Init
  var app = express();

  // Config
  app.set('port', config.PORT);

  app.use(bodyParser.urlencoded({
    limit: '70mb',
    extended: true
  }));
  app.use(bodyParser.json({limit: '70mb'}));


  app.use(morgan('short'));

  app.set('views', './views');
  app.set('view engine', 'jade');
  app.use(express.static('./public'));

  // Setup routes
  routes(app);

  return app;
};

module.exports = initApp;