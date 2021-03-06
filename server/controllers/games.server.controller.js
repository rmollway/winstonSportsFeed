
/* Dependencies */
var mongoose = require('mongoose'),
    http = require('https'),
    request = require('request'),
    fs = require('fs'),
    Weather = require('../models/weather.server.model.js'),
    Game = require('../models/games.server.model.js');

const httpOptions = {
    hostname: 'www.api.mysportsfeeds.com',
    port: '443',
    path: 'https://api.mysportsfeeds.com/v1.1/pull/nhl/latest/team_gamelogs.json?team=chi&date=since-1-weeks-ago&teamstats=GF,GA',
    method: 'GET',
    auth: "Basic cm1vbGx3YXk6Uk05MjExMDQ="
};

const weatherOpts = {
  hostname: 'www.api.wunderground.com',
  port: '80',
  path: 'http://api.wunderground.com/api/143a168ed4a5e9e2/conditions/q/FL/Gainesville.json',
  method: 'GET'
};

Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };

var latestWeatherUpdate;

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

    var otherTeamValue;
    switch(otherTeam) {
      case "TBL":
        otherTeamValue = "a";
        break;

      case "DET":
        otherTeamValue = "b";
        break;

      case "ANA":
        otherTeamValue = "c";
        break;

      case "ARI":
        otherTeamValue = "d";
        break;

      case "BOS":
        otherTeamValue = "e";
        break;

      case "BUF":
        otherTeamValue = "f";
        break;

      case "CGY":
        otherTeamValue = "g";
        break;

      case "CAR":
        otherTeamValue = "h";
        break;

      case "COL":
        otherTeamValue = "i";
        break;

      case "CBJ":
        otherTeamValue = "j";
        break;

      case "DAL":
        otherTeamValue = "k";
        break;

      case "WPJ":
        otherTeamValue = "l";
        break;

      case "EDM":
        otherTeamValue = "m";
        break;

      case "FLO":
        otherTeamValue = "n";
        break;

      case "LAK":
        otherTeamValue = "o";
        break;

      case "MIN":
        otherTeamValue = "p";
        break;

      case "MTL":
        otherTeamValue = "q";
        break;

      case "NSH":
        otherTeamValue = "r";
        break;

      case "NJD":
        otherTeamValue = "s";
        break;

      case "NYI":
        otherTeamValue = "t";
        break;

      case "NYR":
        otherTeamValue = "u";
        break;

      case "OTT":
        otherTeamValue = "v";
        break;

      case "PHI":
        otherTeamValue = "w";
        break;

      case "PIT":
        otherTeamValue = "x";
        break;

      case "SJS":
        otherTeamValue = "y";
        break;

      case "STL":
        otherTeamValue = "z";
        break;

      case "WSH":
        otherTeamValue = "{";
        break;

      case "TOR":
        otherTeamValue = "|";
        break;

      case "VAN":
        otherTeamValue = "`";
        break;

      case "VGK":
        otherTeamValue = "~";
        break;

      default:
        otherTeamValue = "m"; // arbitrarily chose edmonton
        break;
    }



    var chiScore = latestGame.stats.GoalsFor;
    var otherScore = latestGame.stats.GoalsAgainst;

    var chiString = JSON.stringify(chiScore);
    var otherString = JSON.stringify(otherScore);

    var textIndex = otherString.search("#text");
    var tempOppScore = otherString.substring(textIndex+7);
    tempOppScore = tempOppScore.substring(tempOppScore.search('"'), tempOppScore.search('}'));

    textIndex = chiString.search("#text");
    var tempChiScore = chiString.substring(textIndex+7);
    tempChiScore = tempChiScore.substring(tempChiScore.search('"'), tempChiScore.search('}'));

    tempChiScore = parseInt(tempChiScore.replace(/"/g,""));
    tempOppScore = parseInt(tempOppScore.replace(/"/g,""));

    var ret = {
      'opponent': otherTeamValue,
      'chi': tempChiScore,
      'opp': tempOppScore
    };

    res.json(ret);
  });
};

exports.weather = function(req, res) {

  Weather.find({}, function(err, allRecordings) {
    allRecordings.sort(function(a,b) { return (a.updateTime > b.updateTime) ? -1 : 1});

    latestWeatherUpdate = allRecordings[0];

    var now = new Date();
    var diff = parseInt(now.getUnixTime()) - parseInt(latestWeatherUpdate.updateTime);
    console.log('Diff: ' + diff);

    // api allows 1000 requests per day, equates to approximately 3 minutes between requests
    if(diff > 180)
    {
      console.log('New Weather Requested');
      request.get({url: weatherOpts.path}, function(error, response, body) {
        var newWeather = JSON.parse(body);

        var condition = newWeather.current_observation.weather;
        if(condition.search('Light') >= 0 || condition.search('Heavy') >= 0)
        {
          var index = condition.indexOf(' ');
          condition = condition.substring(index+1);
        }

        switch(condition) {
          case "Drizzle":
          case "Rain":
            // condition = "Rain";
            condition = "S";
            break;

          case "Snow":
          case "Snow Grains":
          case "Ice Crystals":
          case "Ice Pellets":
          case "Hail":
          case "Mist":
          case "Fog":
          case "Fog Patches":
          case "Smoke":
          case "Volcanic Ash":
          case "Widespread Dust":
          case "Sand":
          case "Haze":
          case "Spray":
          case "Dush Whirls":
          case "Sandstorm":
          case "Low Drifting Snow":
          case "Low Drifting Widespread Dust":
          case "Low Drifting Sand":
          case "Blowing Snow":
          case "Blowing Widespread Dust":
          case "Blowing Sand":
            // condition = "Overcast";
            condition = "R";
            break;

          case "Rain Mist":
          case "Rain Showers":
          case "Snow Showers":
          case "Snow Blowing Snow Mist":
          case "Ice Pellet Showers":
          case "Hail Showers":
          case "Small Hail Showers":
            // condition = "Rain";
            condition = "S";
            break;

          case "Thunderstorm":
          case "Thunderstorms and Rain":
          case "Thunderstorms and Snow":
          case "Thunderstorms and Ice Pellets":
          case "Thunderstorms with Hail":
          case "Thunderstorms with Small Hail":
            // condition = "Scattered Thunderstorms";
            condition = "T";
            break;

          case "Freezing Drizzle":
          case "Freezing Rain":
            // condition = "Rain";
            condition = "S";
            break;

          case "Freezing Fog":
          case "Patches of Fog":
          case "Shallow Fog":
          case "Partial Fog":
          case "Overcast":
            // condition = "Overcast";
            condition = "R";
            break;

          case "Clear":
            // condition = "Sunny";
            condition = "P";
            break;

          case "Partly Cloudy":
          case "Mostly Cloudy":
          case "Scattered Clouds":
            // condition = "Partly Cloudy";
            condition = "Q";
            break;

          case "Small Hail":
          case "Squalls":
            // condition = "Rain";
            condition = "S";
            break;

          case "Funnel Cloud":
          case "Unknown Precipitation":
          case "Unknown":
            // condition = "Partly Cloudy";
            condition = "Q";
            break;

          default:
            // condition = "Partly Cloudy";
            condition = "Q";
            break;
        }

        var responseWeather = new Weather({
          'updateTime': parseInt(newWeather.current_observation.local_epoch),
          'condition': condition,
          'tempF': parseInt(newWeather.current_observation.temp_f)
        });

        var shortResponse = {
          'condition': responseWeather.condition,
          'tempF': responseWeather.tempF
        };

        res.json(shortResponse);
        responseWeather.save();
      });
    }
    else
    {
      console.log('Old Data Served');
      var shortResponse = {
        'condition': latestWeatherUpdate.condition,
        'tempF': latestWeatherUpdate.tempF
      };
      res.json(shortResponse);
    }

  });
};
