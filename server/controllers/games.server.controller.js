
/* Dependencies */
var mongoose = require('mongoose'),
    http = require('https'),
    request = require('request'),
    Game = require('../models/games.server.model.js');

const httpOptions = {
    hostname: 'www.api.mysportsfeeds.com',
    port: '443',
    path: 'https://api.mysportsfeeds.com/v1.1/pull/nhl/latest/team_gamelogs.json?team=chi&date=since-1-weeks-ago&teamstats=GF,GA',
    method: 'GET',
    auth: "Basic cm1vbGx3YXk6Uk05MjExMDQ="
};

exports.latestGame = function(req, res) {

  request.get({url: httpOptions.path, headers: {Authorization: httpOptions.auth}}, function(error, response, body) {
    var newGames = JSON.parse(body);

    var index = Object.keys(newGames.teamgamelogs.gamelogs).length - 1;
    var latestGame = newGames.teamgamelogs.gamelogs[index];
    var otherTeam;
    if(latestGame.game.homeTeam.Abbreviation == "CHI") {
      otherTeam = latestGame.game.awayTeam.Abbreviation;
    }
    else {
      otherTeam = latestGame.game.homeTeam.Abbreviation;
    }
    var chiScore = latestGame.stats.GoalsFor;
    var otherScore = latestGame.stats.GoalsAgainst;

    var ret = {
      'opponent': otherTeam,
      'chicagoScore': chiScore,
      'opponentScore': otherScore
    };

    res.json(ret);
    console.log(chiScore);
  });
};
