import chokidar = require('chokidar');
const shell = require('shelljs');
const { Logger } = require('@hmcts/nodejs-logging');
const reload = require('reload');

const logger = Logger.getLogger('watch.js');
export default function watch(app: any) {
  let reloadServer = reload(app);
  let watchInstances = {};
  watchInstances['sass'] = chokidar.watch(['./app/client/sass'], { ignored: /(^|[\/\\])\../ }).on('change', (event, path) => {
    logger.info(event, path);
    shell.exec('yarn build-sass');
  });

  watchInstances['javascript'] = chokidar.watch(['./app/client/javascript'], { ignored: /(^|[\/\\])\../ }).on('change', (event, path) => {
    logger.info(event, path);
    shell.exec('yarn build-js:dev');
  });

  watchInstances['public'] = chokidar.watch(['./public', './views'], { ignored: /(^|[\/\\])\../ }).on('all', (event, path) => {
    // logger.info('Public Folder Updated: Refreshing browser.', event, path);
    reloadServer.reload();
  });

  return watchInstances;
}
