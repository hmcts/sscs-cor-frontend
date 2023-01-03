import { expect, sinon } from 'test/chai-sinon';
import watch from 'app/server/watch';
import { setupApp } from 'app/server/app';
import chokidar from 'chokidar';
import { Application } from 'express';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

import shell from 'shelljs';

import { createSession } from 'app/server/middleware/session';

describe('watch.ts', function () {
  let chokidaySpy = null;
  let shellSpy = null;
  let loggerSpy = null;
  let app: Application = null;
  let watchInstances = null;
  let logger: LoggerInstance = null;

  before(async function () {
    logger = Logger.getLogger('watch.js');
    // eslint-disable-next-line mocha/no-nested-tests
    app = await setupApp(createSession());
    chokidaySpy = sinon.spy(chokidar, 'watch');
    shellSpy = sinon.spy(shell, 'exec');
    loggerSpy = sinon.spy(logger, 'info');
    [watchInstances] = await Promise.all([watch(app)]);
    watchInstances.sass.emit('change', './app/client/sass');
    watchInstances.javascript.emit('change', './app/client/javascript');
    watchInstances.public.emit('all', './public');
  });

  after(function () {
    sinon.restore();
  });

  it('Expect chokidar watch to be called', function () {
    expect(chokidaySpy.callCount).to.equal(3);
  });

  it('Expect logger  to be called', function () {
    expect(loggerSpy.callCount).to.equal(2);
  });

  it('Expect shell  to be called', function () {
    expect(shellSpy.callCount).to.equal(2);
  });
});
