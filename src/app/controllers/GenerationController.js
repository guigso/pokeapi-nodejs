import api from '../services/api';

class GenerationController {
  constructor() {
    this.random = -1;

    this.getRandomNumber = () => {
      var newRandom = -1;
      do {
        newRandom = Math.floor(Math.random() * 16) + 1;
      } while (newRandom === this.random);
      this.random = newRandom;
      return newRandom;
    };
  }

  async index(req, res) {
    try {
      const genController = new GenerationController();
      var response = await api.get(`/generation/${req.params.id}`);

      var pokemons = [];
      response.data.pokemon_species.forEach(ele => {
        pokemons.push({
          id: ele.url.split('/').slice(6)[0],
          name: ele.name,
          sprite: process.env.SPRITE_BASE_URL + ele.url.split('/').slice(6)[0] + '.png'
        });
      });

      pokemons.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      var random = genController.getRandomNumber();

      return res.json({
        pokemons,
        background:
          (process.env.PUBLIC_URL || 'http://localhost:3000') + `/background-${random}.png`,
        header: (process.env.PUBLIC_URL || 'http://localhost:3000') + `/header-${random}.png`
      });
    } catch (err) {
      return res.json({ error: err });
    }
  }
}

export default new GenerationController();
