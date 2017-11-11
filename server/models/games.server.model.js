/* Import mongoose and define any variables needed to create the schema */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/* Create your schema */
var gameSchema = new Schema({
  opponent: String,
  opponentIndex: Number,
  chicagoScore: Number,
  opponentScore: Number,
  result: String,
  date: Date
});

/* Use your schema to instantiate a Mongoose model */
var Game = mongoose.model('Game', gameSchema);

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = Game;
