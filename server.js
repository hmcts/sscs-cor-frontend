const { Logger } = require('@hmcts/nodejs-logging');
const config = require('config');
const { setup } = require('app');
const sessionHandler = require('app/middleware/session');

const logger = Logger.getLogger('server.js');

const port = config.get('node.port');
const app = setup(sessionHandler);

app.listen(port, error => {
  if (error) {
    logger.error(`Unable to start server because of ${error.message}`);
  } else {
    logger.info(`Server listening on port ${port}`);
  }
});
