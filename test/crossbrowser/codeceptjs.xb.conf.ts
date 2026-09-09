import config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';

const logger: LoggerInstance = Logger.getLogger('crossbrowser.playwright.conf');

// URL under test and headless option
const url = process.env.TEST_URL || config.get('testUrl');
const headlessEnv = process.env.HEADLESS;
const headless = headlessEnv === undefined ? true : headlessEnv !== 'false';

let codeceptOutput = './functional-output'; // default for local runs
let reportDir = './functional-report'; // default for local runs


const helpers = {
  Playwright: {
    url,
    show: !headless,
    // do not set a fixed browser here; each `multiple` run will override it
    waitForTimeout: '10000',
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
          reportFilename: 'index',
          inlineAssets: true,
          quiet: true,
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
