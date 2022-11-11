import { expect, sinon } from 'test/chai-sinon';
import * as nunjucks from 'nunjucks';
import * as appConfigs from '../../app/server/app-configurations';
import i18next from 'i18next';
import { Application } from 'express';
import express = require('express');
import { Environment } from 'nunjucks';

describe('app-configuration', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('configureNunjucks', () => {
    const configNunjucks: object = {
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
      express: sandbox.stub(),
      tyaNunjucks: sandbox.stub(),
    };
    sandbox.stub(nunjucks, 'configure').returns(configNunjucks as Environment);
    const app: Application = express();
    app.locals.i18n = i18next;

    appConfigs.configureNunjucks(app);

    expect(nunjucks.configure([]).addFilter).to.have.been.callCount(10);
  });
});
