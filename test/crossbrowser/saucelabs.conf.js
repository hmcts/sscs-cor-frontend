/* eslint-disable no-process-env */

const config = require('config');
const supportedBrowsers = require('./supportedBrowsers.js');
const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('saucelabs.conf.js');
const tunnelName = process.env.SAUCE_TUNNEL_IDENTIFIER || config.get('saucelabs.tunnelId');

const getBrowserConfig = browserGroup => {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const desiredCapability = supportedBrowsers[browserGroup][candidateBrowser];
      desiredCapability.tunnelIdentifier = tunnelName;
      desiredCapability.tags = ['sscs cor'];
      browserConfig.push({
        browser: desiredCapability.browserName,
        desiredCapabilities: desiredCapability
      });
    } else {
      logger.error('supportedBrowsers.js is empty or incorrectly defined');
    }
  }
  return browserConfig;
};

const pauseFor = seconds => {
  const secondsToMilis = 1000;
  setTimeout(() => true, seconds * secondsToMilis);
};

const setupConfig = {
  tests: './journeys/*.test.js',
  output: config.get('saucelabs.outputDir'),
  require: ['ts-node/register'],
  helpers: {
    WebDriverIO: {
      url: process.env.TEST_URL || config.get('testUrl'),
      browser: process.env.SAUCE_BROWSER || config.get('saucelabs.browser'),
      waitForTimeout: parseInt(config.get('saucelabs.waitForTimeout')),
      smartWait: parseInt(config.get('saucelabs.smartWait')),
      cssSelectorsEnabled: 'true',
      host: 'ondemand.saucelabs.com',
      port: 80,
      user: process.env.SAUCE_USERNAME || config.get('saucelabs.username'),
      key: process.env.SAUCE_ACCESS_KEY || config.get('saucelabs.key'),
      desiredCapabilities: {
        idleTimeout: 180
      }
    },
    BootstrapHelper: { require: './helpers/BootstrapHelper' },
    SauceLabsReportingHelper: { require: './helpers/SauceLabsReportingHelper.js' }
  },
  include: {
    I: './pages/steps.js'
  },
  teardownAll: done => {
    // Pause to allow SauceLabs to finish updating before Jenkins queries it for results
    const thirtySeconds = 30;
    logger.info(`Wait for ${thirtySeconds} seconds before Jenkins queries SauceLabs results...`);
    pauseFor(thirtySeconds);
    done();
  },
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: { steps: true }
      },
      mochawesome: {
        stdout: './functional-output/console.log',
        options: {
          reportDir: config.get('saucelabs.outputDir'),
          reportName: 'index',
          inlineAssets: true
        }
      }
    }
  },
  multiple: {
    microsoft: {
      browsers: getBrowserConfig('microsoft')
    },
    chrome: {
      browsers: getBrowserConfig('chrome')
    },
    firefox: {
      browsers: getBrowserConfig('firefox')
    },
    safari: {
      browsers: getBrowserConfig('safari')
    }
  },
  name: 'SSCS COR Crossbrowser Tests'
};

exports.config = setupConfig;