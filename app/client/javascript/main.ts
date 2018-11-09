import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
const domready = require('domready');

let evidenceUpload;

function initEvidenceUpload() {
  const evidenceUploadContainer = document.getElementById('evidence-upload');
  if (evidenceUploadContainer) {
    evidenceUpload = new EvidenceUpload();
  }
}

domready(function () {
  govUK.initAll();
  expandingTextBox.init();
  initEvidenceUpload();
});

export default {};
