import { expect, sinon } from 'test/chai-sinon';
import nunjucks, { Environment } from 'nunjucks';
import * as appConfigs from 'app/server/app-configurations';
import i18next from 'i18next';
import express, { Application } from 'express';

describe('app-configuration', function () {
  afterEach(function () {
    sinon.restore();
  });

  it('configureNunjucks', function () {
    const configNunjucks: object = {
      addFilter: sinon.stub(),
      options: { autoescape: true },
      render: sinon.stub(),
      renderString: sinon.stub(),
      getFilter: sinon.stub(),
      addExtension: sinon.stub(),
      removeExtension: sinon.stub(),
      getExtension: sinon.stub(),
      hasExtension: sinon.stub(),
      addGlobal: sinon.stub(),
      getTemplate: sinon.stub(),
      express: sinon.stub(),
      tyaNunjucks: sinon.stub(),
    };
    sinon.stub(nunjucks, 'configure').returns(configNunjucks as Environment);
    const app: Application = express();
    app.locals.i18n = i18next;

    appConfigs.configureNunjucks(app);

    expect(nunjucks.configure([]).addFilter).to.have.been.callCount(9);
  });
});
