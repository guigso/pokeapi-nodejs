import { Router } from 'express';
import api from './services/api';

const routes = new Router();
const base_img_url = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
function getDetails(detailObj) {
  var filtered = {};
  var objKeys = Object.keys(detailObj);

  objKeys.forEach(ele => {
    if (detailObj[ele] !== null && detailObj[ele] !== '' && ele !== 'turn_upside_down')
      filtered[ele] = detailObj[ele];
  });

  return filtered;
}
routes.get('/:id', async (req, res) => {
  var response = await api.get(`/generation/${req.params.id}`);

  var pokemons = [];
  response.data.pokemon_species.forEach(ele => {
    pokemons.push({
      id: ele.url.split('/').slice(6)[0],
      name: ele.name,
      sprite: base_img_url + ele.url.split('/').slice(6)[0] + '.png'
    });
  });

  pokemons.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  return res.json(pokemons);
});

routes.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await api.get(`/pokemon/${id}`);
    const specieResponse = await api.get(`/pokemon-species/${id}`);

    if (specieResponse.data.evolution_chain.url) {
      const evoResponse = await api.get(specieResponse.data.evolution_chain.url);
      var evoChain = [];
      var evoData = evoResponse.data.chain;
      var evo_chain_level = 0;
      do {
        evo_chain_level++;
        let numberOfEvolutions = evoData['evolves_to'].length;
        var evoDetails = evoData['evolution_details'][0];

        evoChain.push({
          name: evoData.species.name,
          id: evoData.species.url.split('/')[6],
          sprite: base_img_url + evoData.species.url.split('/')[6] + '.png',
          evo_chain_level
        });

        if (numberOfEvolutions > 1) {
          for (let i = 1; i < numberOfEvolutions; i++) {
            evoChain.push({
              name: evoData.evolves_to[i].species.name,
              id: evoData.evolves_to[i].species.url.split('/')[6],
              sprite: base_img_url + evoData.species.url.split('/')[6] + '.png',
              evolution_details: getDetails(evoData.evolves_to[i].evolution_details[0]),
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
});

export default routes;
