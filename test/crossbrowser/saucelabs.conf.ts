import config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';

const logger: LoggerInstance = Logger.getLogger('crossbrowser.playwright.conf');

// URL under test and headless option
const url = process.env.TEST_URL || config.get('testUrl');
const headlessEnv = process.env.HEADLESS;
const headless = headlessEnv === undefined ? true : headlessEnv !== 'false';
// Determine where to put CodeceptJS artifacts (screenshots, logs) and where
// mochawesome should write the HTML report. Jenkins expects the report and
// output under test/e2e, so default to those paths unless overridden in
// configuration (crossbrowser.outputDir or saucelabs.outputDir).
let codeceptOutput = './functional-output'; // default for local runs
let reportDir = './functional-report'; // default for local runs
// if (config.has('crossbrowser.outputDir')) {
//   codeceptOutput = config.get('crossbrowser.outputDir');
//   reportDir = config.get('crossbrowser.outputDir');
// } else if (config.has('saucelabs.outputDir')) {
//   codeceptOutput = config.get('saucelabs.outputDir');
//   reportDir = config.get('saucelabs.outputDir');
// } else {
//   // Jenkins expects these locations by the pipeline
  codeceptOutput = 'test/crossbrowser/crossbrowser-output';
  reportDir = 'test/crossbrowser/crossbrowser-report';
// }

const helpers = {
  Playwright: {
    url,
    show: !headless,
    // do not set a fixed browser here; each `multiple` run will override it
    waitForTimeout: parseInt(
      config.has('saucelabs.waitForTimeout')
        ? config.get('saucelabs.waitForTimeout')
        : '10000'
    ),
    cssSelectorsEnabled: 'true',
    // additional options can be provided per-run via `multiple` section
  },
  BootstrapHelper: { require: './helpers/BootstrapHelper' },
  TeardownHelper: { require: './helpers/TeardownHelper' },
  GeneralHelpers: { require: './helpers/GeneralHelpers' },
};

export const setupConfig = {
  tests: './journeys/*.test.js',
  output: codeceptOutput,
  require: ['ts-node/register'],
  helpers,
  include: {
    I: './pages/steps.js',
  },
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: { steps: true },
      },
      mochawesome: {
        stdout: `${reportDir}/console.log`,
        options: {
          reportDir,
          reportName: 'index',
          inlineAssets: true,
        },
      },
    },
  },
  multiple: {
    chromium: {
      // run using Playwright chromium
      browsers: [
        {
          browser: 'chromium',
          helpers: {
            Playwright: {
              browser: 'chromium',
              show: !headless,
            },
          },
        },
      ],
      restart: true,
    },
    firefox: {
      browsers: [
        {
          browser: 'firefox',
          helpers: {
            Playwright: {
              browser: 'firefox',
              show: !headless,
            },
          },
        },
      ],
      restart: true,
    },
    webkit: {
      browsers: [
        {
          browser: 'webkit',
          helpers: {
            Playwright: {
              browser: 'webkit',
              show: !headless,
            },
          },
        },
      ],
      restart: true,
    },
  },
  name: 'SSCS COR Crossbrowser Tests',
};

exports.config = setupConfig;
