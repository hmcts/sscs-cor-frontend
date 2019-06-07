import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
import { CheckCookies } from './check-cookies';
import { SessionInactivity } from './session-inactivity';
import { DetailsTabIndexToggle } from './detailsToggle';

const domready = require('domready');

function goBack() {
  window.history.go(-1);
  return false;
}

const onReady = () => {
  const checkCookies = new CheckCookies();
  const evidence = new EvidenceUpload();
  const sessionInactivity = new SessionInactivity();
  const detailsToggle = new DetailsTabIndexToggle();

  checkCookies.init();
  govUK.initAll();
  expandingTextBox.init();
  sessionInactivity.init();
  detailsToggle.init();

  document.querySelectorAll('#buttonBack').forEach(element => element.addEventListener('click', goBack));
};

domready(onReady);

export {
  onReady
};
