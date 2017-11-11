var path = require('path'),
    express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    gamesRouter = require('../routes/games.server.routes');

module.exports.init = function() {
  //connect to database
  mongoose.connect(config.db.uri);

  //initialize app
  var app = express();

  //enable request logging for development debugging
  app.use(morgan('dev'));

  //body parsing middleware
  app.use(bodyParser.json());

  /* serve static files */
  // app.use(express.static(path.join(__dirname , '../../client/')));

  /* use the games router for requests to the api */
  app.use('/api', gamesRouter);

  /* go to homepage for all routes not specified */
  app.use('*', function(req, res){
    res.redirect('/');
  });


  return app;
};
