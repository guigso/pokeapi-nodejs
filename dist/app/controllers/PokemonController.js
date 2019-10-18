"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _api = require('../services/api'); var _api2 = _interopRequireDefault(_api);

class PokemonController {
  constructor() {
    this.getDetails = detailObj => {
      var filtered = {};
      var objKeys = Object.keys(detailObj);

      objKeys.forEach(ele => {
        if (detailObj[ele] !== null && detailObj[ele] !== '' && ele !== 'turn_upside_down')
          filtered[ele] = detailObj[ele];
      });
      filtered.trigger = filtered.trigger.name;
      return filtered;
    };
  }

  async index(req, res) {
    try {
      const { id } = req.params;
      var base_img_url = process.env.SPRITE_BASE_URL;
      const response = await _api2.default.get(`/pokemon/${id}`);
      const specieResponse = await _api2.default.get(`/pokemon-species/${id}`);
      var pokeController = new PokemonController();
      if (specieResponse.data.evolution_chain.url) {
        const evoResponse = await _api2.default.get(specieResponse.data.evolution_chain.url);
        var evoChain = [];
        var evoData = evoResponse.data.chain;
        do {
          evoData.evolves_to.forEach(ele => {
            ele['evolution_details'].forEach(item => {
              evoChain.push({
                name: evoData.species.name,
                id: evoData.species.url.split('/')[6],
                sprite: base_img_url + evoData.species.url.split('/')[6] + '.png',
                evolves_to: {
                  name: ele.species.name,
                  id: ele.species.url.split('/')[6],
                  sprite: base_img_url + ele.species.url.split('/')[6] + '.png',
                  details: item ? pokeController.getDetails(item) : null
                }
              });
            });
          });
          evoData = evoData['evolves_to'][0];
        } while (!!evoData && evoData.hasOwnProperty('evolves_to'));
        var evolutionChain = evoChain;
      }
      var pokemon = {
        id: response.data.id,
        name: response.data.name,
        sprite: response.data.sprites.front_default,
        types: response.data.types.reverse(),
        evo_chain: evolutionChain
      };

      return res.json({
        pokemon
      });
    } catch (err) {
      console.log(err);
      return res.json({ error: err });
    }
  }
}

exports. default = new PokemonController();
