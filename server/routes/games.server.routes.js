/* Dependencies */
var games = require('../controllers/games.server.controller.js')
    express = require('express'),
    router = express.Router();

/*
  These method calls are responsible for routing requests to the correct request handler.
  Take note that it is possible for different controller functions to handle requests to the same route.
 */
router.route('/game')
  .get(games.latestGame)

router.route('/weather')
  .get(games.weather)

module.exports = router;
