import app from './app';
import { logger } from './utils/logger';
import { config } from './config';

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`ETS Off-Chain API running on port ${PORT}`);
});
