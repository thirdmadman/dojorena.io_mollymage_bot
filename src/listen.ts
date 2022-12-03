import { app } from './index';
import { PORT, NODE_ENV, GAME_HOST } from './common/config';
import GameAPI from './bot/Client/GameAPI';
import MyLogicResolver from './MyLogicResolver';

const start = async () => {
  try {
    await app.listen({ port: parseInt(PORT, 10), host: '0.0.0.0' });
    if (GAME_HOST) {
      const myLogicResolver = new MyLogicResolver();
      const game = new GameAPI(GAME_HOST, myLogicResolver);
      game.connect();
    } else {
      console.error('Could not start server, GAME_HOST is not defined');
    }
  } catch (err) {
    console.log(err);
    app.log.error(err);
    process.exit(1);
  }
};

if (NODE_ENV && NODE_ENV === 'development') {
  process.on('uncaughtException', (error) => {
    console.error(error);
  });
  process.on('unhandledRejection', (error) => {
    console.error(error);
  });
}

start();
