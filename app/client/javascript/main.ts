import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
import { CheckCookies } from './check-cookies';
const domready = require('domready');

let evidenceUpload;
let checkCookies;

function initEvidenceUpload() {
  const evidenceUploadContainer = document.getElementById('evidence-upload');
  if (evidenceUploadContainer) {
    evidenceUpload = new EvidenceUpload();
  }
}

function initCheckCookies() {
  checkCookies = new CheckCookies();
  let isCookiesEnabled = checkCookies.testCookies(window);
  checkCookies.toggleBanner(isCookiesEnabled);
}

domready(function () {
  initCheckCookies();
  govUK.initAll();
  expandingTextBox.init();
  initEvidenceUpload();
});

export default {};
