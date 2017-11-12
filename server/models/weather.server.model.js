/* Import mongoose and define any variables needed to create the schema */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/* Create your schema */
var weatherSchema = new Schema({
  updateTime: Number,
  condition: String,
  tempF: Number
});

/* Use your schema to instantiate a Mongoose model */
var Weather = mongoose.model('Weather', weatherSchema);

/* Export the model to make it avaiable to other parts of your Node application */
module.exports = Weather;
