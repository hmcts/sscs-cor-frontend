import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
import { CheckCookies } from './check-cookies';
import { SessionInactivity } from './session-inactivity';

const domready = require('domready');

function goBack() {
  window.history.go(-1);
  return false;
}

const onReady = () => {
  let checkCookies = new CheckCookies();
  const evidence = new EvidenceUpload();
  let sessionInactivity = new SessionInactivity();
  checkCookies.init();
  govUK.initAll();
  expandingTextBox.init();
  sessionInactivity.init();

  document.querySelectorAll('#buttonBack').forEach(element => element.addEventListener('click', goBack));
};

domready(onReady);

export {
  onReady
};
