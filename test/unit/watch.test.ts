import { expect, sinon } from 'test/chai-sinon';
import watch from 'app/server/watch';
import { setup } from '../../app/server/app';
import chokidar = require('chokidar');
const { createSession } = require('../../app/server/middleware/session');
const shell = require('shelljs');
const { Logger } = require('@hmcts/nodejs-logging');

describe('watch.ts', () => {
  const sb = sinon.createSandbox();
  let chokidaySpy;
  let shellSpy;
  let loggerSpy;
  let app;
  let watchInstances;
  const logger = Logger.getLogger('watch.js');

  before(() => {
    app = setup(createSession(), { disableAppInsights: true });
    chokidaySpy = sb.spy(chokidar, 'watch');
    shellSpy = sb.spy(shell, 'exec');
    loggerSpy = sb.spy(logger, 'info');
    watchInstances = watch(app);
    watchInstances['sass'].emit('change', './app/client/sass');
    watchInstances['javascript'].emit('change', './app/client/javascript');
    watchInstances['public'].emit('all', './public');
  });

  after(() => {
    sb.restore();
  });

  it('Expect chokidar watch to be called', () => {
    expect(chokidaySpy.callCount).to.equal(3);
  });

  it('Expect logger  to be called', () => {
    expect(loggerSpy.callCount).to.equal(2);
  });

  it('Expect shell  to be called', () => {
    expect(shellSpy.callCount).to.equal(2);
  });
});
