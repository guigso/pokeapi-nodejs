import { Router } from 'express';
import api from './app/services/api';

import GenerationController from './app/controllers/GenerationController';
import PokemonController from './app/controllers/PokemonController';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Use GET /generation/:id or GET /details/:pokemon_id' });
});

routes.get('/generation/:id', GenerationController.index);

routes.get('/details/:id', PokemonController.index);

export default routes;
