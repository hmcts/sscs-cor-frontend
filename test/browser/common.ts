/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const { createServer } = require('http');
const createSession = require('app/middleware/session');
const coh = require('test/fixtures/coh');
const { setup } = require('app/server/app');
const config = require('config');
const dysonSetup = require('test/mock/dysonSetup');

const testUrl = config.get('testUrl');
const port = config.get('node.port');
const headless = config.get('headless') !== 'false';
const httpProxy = config.get('httpProxy');
const testingLocalhost = testUrl.indexOf('localhost') !== -1;
const tenSeconds = 10000;

let browser;
let server;
let cohTestData;

async function startBrowser() {
  if (!browser) {
    console.log('Starting browser');
    const args = ['--no-sandbox', '--start-maximized'];
    if (httpProxy) {
      args.push(`-proxy-server=${httpProxy}`);
    }
    const opts = {
      args,
      headless,
      timeout: 10000,
      ignoreHTTPSErrors: true
    };
    try {
      browser = await puppeteer.launch(opts);
    } catch (error) {
      console.log('Unable to start browser', error);
    }
  }
}

function startAppServer() {
  if (!server && testingLocalhost) {
    const app = setup(createSession(), { disableAppInsights: true });
    dysonSetup();
    server = createServer(app).listen(port, error => {
      if (error) {
        console.log(`Unable to start server on port ${port} because of ${error.message}`);
        return Promise.reject(error);
      }
      console.log(`Starting server on port ${port}`);
      return Promise.resolve();
    });
  }
}

/* eslint-disable-next-line consistent-return */
async function bootstrapCoh() {
  if (!cohTestData && !testingLocalhost) {
    try {
      const hearingId = await coh.createOnlineHearing();
      const question = await coh.createQuestion(hearingId);
      const questionId = question.question_id;
      await coh.setQuestionRoundToIssued(hearingId);
      console.log('Waiting 10s for question round to be issued');
      await new Promise(r => setTimeout(r, tenSeconds));
      const questionRound = await coh.getQuestionRound(hearingId, 1);
      const questionRoundState = questionRound.question_round_state.state_name;
      if (questionRoundState !== 'question_issued') {
        await Promise.reject(new Error(`Question round state not issued: ${questionRoundState}`));
      }
      console.log('Question round issued successfully');
      const questionHeader = questionRound.question_references[0].question_header_text;
      const deadlineExpiryDate = questionRound.question_references[0].deadline_expiry_date;
      cohTestData = { hearingId, questionId, questionHeader, deadlineExpiryDate };
    } catch (error) {
      console.log('Error bootstrapping COH with test data', error);
      return Promise.reject(error);
    }
  }
}

async function startServices(options) {
  const opts = options || {};
  if (opts.bootstrapCoh) {
    await bootstrapCoh();
  }
  await startAppServer();
  await startBrowser();
  const page = await browser.newPage();
  await page.setViewport({
    height: 700,
    width: 1100
  });
  return { page, cohTestData: cohTestData || {} };
}

after(async() => {
  if (server && server.close) {
    console.log('Killing server');
    server.close();
  }
  if (browser && browser.close) {
    console.log('Killing browser');
    await browser.close();
  }
});

export = { startServices };
