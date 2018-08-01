const { Logger } = require('@hmcts/nodejs-logging');
const config = require('config');
const { setup } = require('app');

const logger = Logger.getLogger('server.js');

const port = config.get('node.port');
const app = setup();
app.listen(port);
logger.info(`Server listening on port: ${port}`);
