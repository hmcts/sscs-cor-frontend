import chokidar = require('chokidar');
const shell = require('shelljs');
const { Logger } = require('@hmcts/nodejs-logging');
const reload = require('reload');

const logger = Logger.getLogger('watch.js');
export default function watch(app: any) {
  let reloadServer = reload(app);

  chokidar.watch(['./app/client/sass'], { ignored: /(^|[\/\\])\../ }).on('change', (event, path) => {
    logger.info(event, path);
    shell.exec('yarn build-sass');
  });

  chokidar.watch(['./app/client/javascript'], { ignored: /(^|[\/\\])\../ }).on('change', (event, path) => {
    logger.info(event, path);
    shell.exec('yarn build-js:dev');
  });

  chokidar.watch(['./public'], { ignored: /(^|[\/\\])\../ }).on('all', (event, path) => {
    // logger.info('Public Folder Updated: Refreshing browser.', event, path);
    reloadServer.reload();
  });
}
