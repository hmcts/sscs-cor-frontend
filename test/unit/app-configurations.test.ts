const express = require('express');
import { expect, sinon } from 'test/chai-sinon';
import * as nunjucks from 'nunjucks';
import * as appConfigs from '../../app/server/app-configurations';

describe('app-configuration', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('configureNunjucks', () => {
    sandbox.stub(nunjucks, 'configure').returns({
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
    } as nunjucks.Environment);
    const app = express();
    appConfigs.configureNunjucks(app);

    expect(nunjucks.configure([]).addFilter).to.have.been.callCount(8);
  });
});
