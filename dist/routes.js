"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _express = require('express');
var _api = require('./app/services/api'); var _api2 = _interopRequireDefault(_api);

var _GenerationController = require('./app/controllers/GenerationController'); var _GenerationController2 = _interopRequireDefault(_GenerationController);
var _PokemonController = require('./app/controllers/PokemonController'); var _PokemonController2 = _interopRequireDefault(_PokemonController);

const routes = new (0, _express.Router)();

routes.get('/', (req, res) => {
  return res.json({ message: 'Use GET /generation/:id or GET /details/:pokemon_id' });
});

routes.get('/generation/:id', _GenerationController2.default.index);

routes.get('/details/:id', _PokemonController2.default.index);

exports. default = routes;
