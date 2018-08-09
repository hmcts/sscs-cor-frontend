/* eslint-disable max-nested-callbacks */
const { expect } = require('test/chai-sinon');
const createSession = require('app/middleware/session');
const { setup } = require('app');
const pa11y = require('pa11y');
const supertest = require('supertest');
const paths = require('paths');
const dysonSetup = require('test/mock/dysonSetup');

const app = setup(createSession(), { disableAppInsights: true });
const agent = supertest.agent(app);
dysonSetup();

const space = 2;

const pa11yTest = pa11y({
  timeout: 10000,
  reporter: 'spec',
  ignore: ['WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs'],
  hideElements: `link[rel=mask-icon], .govuk-header__logotype-crown, .govuk-footer__licence-logo, 
    .govuk-skip-link, .govuk-footer__link`
});

const accessibilityPages = [
  paths.helloWorld,
  `${paths.question}/121/62`
];

accessibilityPages.forEach(page => {
  describe(`Running Accessibility tests for: ${page}`, () => {
    let pageResults = null;
    before(done => {
      pa11yTest.run(agent.get(page).url, (error, results) => {
        if (error) {
          throw new Error(`Pa11y error whilst testing page: ${page}`);
        }
        pageResults = results;
        done();
      });
    });

    it('should pass without errors or warnings', () => {
      const errors = pageResults.filter(result => (
        result.type === 'error' || result.type === 'warning'
      ));
      expect(errors.length).to.equal(0, JSON.stringify(errors, null, space));
    });
  });
});
