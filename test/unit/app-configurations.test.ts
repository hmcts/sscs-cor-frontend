const express = require('express');
import { expect, sinon } from 'test/chai-sinon';
import * as nunjucks from 'nunjucks';
import * as appConfigs from '../../app/server/app-configurations';

describe('app-configuration', () => {
  let sandbox: sinon.SinonSandbox;
  let configNunjucks: object;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    configNunjucks = {
      addFilter: sandbox.stub(),
      options: { autoescape: true },
      render: sandbox.stub(),
      renderString: sandbox.stub(),
      getFilter: sandbox.stub(),
      addExtension: sandbox.stub(),
      removeExtension: sandbox.stub(),
      getExtension: sandbox.stub(),
      hasExtension: sandbox.stub(),
      addGlobal: sandbox.stub(),
      getTemplate: sandbox.stub(),
      express: sandbox.stub()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('configureNunjucks', () => {
    sandbox.stub(nunjucks, 'configure').returns(configNunjucks as nunjucks.Environment);
    const app = express();
    appConfigs.configureNunjucks(app);

    expect(nunjucks.configure([]).addFilter).to.have.been.callCount(9);
  });
});
