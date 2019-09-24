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
        do {
          evo_chain_level++;
          let numberOfEvolutions = evoData['evolves_to'].length;
          var details = evoData['evolution_details'][0]
            ? pokeController.getDetails(evoData['evolution_details'][0])
            : details;

          evoChain.push({
            name: evoData.species.name,
            id: evoData.species.url.split('/')[6],
            sprite: base_img_url + evoData.species.url.split('/')[6] + '.png',
            details,
            evo_chain_level
          });

          if (numberOfEvolutions > 1) {
            for (let i = 1; i < numberOfEvolutions; i++) {
              evoChain.push({
                name: evoData.evolves_to[i].species.name,
                id: evoData.evolves_to[i].species.url.split('/')[6],
                sprite: base_img_url + evoData.species.url.split('/')[6] + '.png',
                evolution_details: pokeController.getDetails(
                  evoData.evolves_to[i].evolution_details[0]
                ),
                evo_chain_level
              });
            }
          }
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
