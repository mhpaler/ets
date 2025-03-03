import app from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`ETS Off-Chain API running on port ${PORT}`);
});
