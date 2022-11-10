import chokidar = require('chokidar');
import reload = require('reload');
import { Application } from 'express';
import { exec } from 'shelljs';
import { Logger } from '@hmcts/nodejs-logging';

const logger = Logger.getLogger('watch.js');
export default async function watch(app: Application): Promise<any> {
  const watchInstances = {
    sass: undefined,
    javascript: undefined,
    public: undefined,
  };
  watchInstances.sass = chokidar
    .watch(['./app/client/sass'], { ignored: /(^|[/\\])\../ })
    .on('change', (event, path) => {
      logger.info(event, path);
      exec('yarn build-sass');
    });

  watchInstances.javascript = chokidar
    .watch(['./app/client/javascript'], { ignored: /(^|[/\\])\../ })
    .on('change', (event, path) => {
      logger.info(event, path);
      exec('yarn build-js:dev');
    });

  const reloadReturned = await reload(app);
  watchInstances.public = chokidar
    .watch(['./public', './views'], { ignored: /(^|[/\\])\../ })
    .on('all', (event, path) => {
      // logger.info('Public Folder Updated: Refreshing browser.', event, path);
      reloadReturned.reload();
    });

  return watchInstances;
}
