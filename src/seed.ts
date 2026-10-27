import { runSeed } from './database/seeds/seed';

runSeed().catch((e) => {
  console.error(e);
  process.exit(1);
});
