import api from '../services/api';

class PokemonController {
  constructor() {
    this.getDetails = detailObj => {
      var filtered = {};
      var objKeys = Object.keys(detailObj);

      objKeys.forEach(ele => {
        if (detailObj[ele] !== null && detailObj[ele] !== '' && ele !== 'turn_upside_down')
          filtered[ele] = detailObj[ele];
      });

      return filtered;
    };
  }

  async index(req, res) {
    try {
      const { id } = req.params;
      var base_img_url = process.env.SPRITE_BASE_URL;
      const response = await api.get(`/pokemon/${id}`);
      const specieResponse = await api.get(`/pokemon-species/${id}`);
      var pokeController = new PokemonController();
      if (specieResponse.data.evolution_chain.url) {
        const evoResponse = await api.get(specieResponse.data.evolution_chain.url);
        var evoChain = [];
        var evoData = evoResponse.data.chain;
        var evo_chain_level = 0;
        evoChain.push({
          name: evoData.species.name,
          id: evoData.species.url.split('/')[6],
          sprite: base_img_url + evoData.species.url.split('/')[6] + '.png',
          evo_chain_level
        });

        do {
          evo_chain_level++;
          var details = evoData['evolution_details'][0]
            ? pokeController.getDetails(evoData['evolution_details'][0])
            : details;

          evoData['evolves_to'].forEach((ele, index) => {
            var details = pokeController.getDetails(evoData.evolves_to[index].evolution_details[0]);
            evoChain.push({
              name: ele.species.name,
              id: ele.species.url.split('/')[6],
              sprite: base_img_url + ele.species.url.split('/')[6] + '.png',
              details,
              evo_chain_level
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

export default new PokemonController();
