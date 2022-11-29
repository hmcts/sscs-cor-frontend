import * as config from 'config';
import * as supportedBrowsers from './supportedBrowsers';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';
import { Protocol } from 'puppeteer';
import integer = Protocol.integer;

const logger: LoggerInstance = Logger.getLogger('saucelabs.conf');
const tunnelName: string =
  process.env.SAUCE_TUNNEL_IDENTIFIER || config.get('saucelabs.tunnelId');

const url = process.env.TEST_URL || config.get('testUrl');

const browser = process.env.SAUCE_BROWSER || config.get('saucelabs.browser');
const waitForTimeout: integer = parseInt(
  config.get('saucelabs.waitForTimeout')
);
const smartWait: integer = parseInt(config.get('saucelabs.smartWait'));
const user: string =
  process.env.SAUCE_USERNAME || config.get('saucelabs.username');
const key: string = process.env.SAUCE_ACCESS_KEY || config.get('saucelabs.key');
const output: string = config.get('saucelabs.outputDir');

export const setupConfig = {
  tests: './journeys/*.test.js',
  output,
  require: ['ts-node/register'],
  helpers: {
    WebDriverIO: {
      url,
      browser,
      waitForTimeout,
      smartWait,
      cssSelectorsEnabled: 'true',
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      user,
      key,
      desiredCapabilities: {
        idleTimeout: 300,
      },
    },
    BootstrapHelper: { require: './helpers/BootstrapHelper' },
    TeardownHelper: { require: './helpers/TeardownHelper' },
    GeneralHelpers: { require: './helpers/GeneralHelpers' },
    SauceLabsReportingHelper: { require: './helpers/SauceLabsReportingHelper' },
  },
  include: {
    I: './pages/steps.js',
  },
  teardownAll: (done) => {
    // Pause to allow SauceLabs to finish updating before Jenkins queries it for results
    const thirtySeconds = 30;
    logger.info(
      `Wait for ${thirtySeconds} seconds before Jenkins queries SauceLabs results...`
    );
    const secondsToMilliseconds = 1000;
    setTimeout(() => true, thirtySeconds * secondsToMilliseconds);
    done();
  },
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: { steps: true },
      },
      mochawesome: {
        stdout: './functional-output/console.log',
        options: {
          reportDir: output,
          reportName: 'index',
          inlineAssets: true,
        },
      },
    },
  },
  multiple: {
    microsoft: {
      browsers: getBrowserConfig('microsoft'),
    },
    chrome: {
      browsers: getBrowserConfig('chrome'),
    },
    firefox: {
      browsers: getBrowserConfig('firefox'),
    },
    safari: {
      browsers: getBrowserConfig('safari'),
    },
  },
  name: 'SSCS COR Crossbrowser Tests',
};

export function getBrowserConfig(browserGroup) {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const desiredCapability =
        supportedBrowsers[browserGroup][candidateBrowser];
      desiredCapability.tunnelIdentifier = tunnelName;
      desiredCapability.tags = ['sscs cor'];
      browserConfig.push({
        browser: desiredCapability.browserName,
        desiredCapabilities: desiredCapability,
      });
    } else {
      logger.error('supportedBrowsers is empty or incorrectly defined');
    }
  }
  return browserConfig;
}
