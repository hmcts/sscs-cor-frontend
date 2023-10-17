import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
import { EvidenceUploadAudioVideo } from './evidence-upload-audio-video';
import { SessionInactivity } from './session-inactivity';
import { DetailsTabIndexToggle } from './details-toggle';
import { RequestType } from './request-type';
import { EvidenceStatement } from './evidence-statement';
import domready from 'domready';

function goBack() {
  window.history.go(-1);
  return false;
}

const onReady = () => {
  const evidence = new EvidenceUpload();
  const evidenceAudioVideo = new EvidenceUploadAudioVideo();
  const sessionInactivity = new SessionInactivity();
  const detailsToggle = new DetailsTabIndexToggle();
  const requestType = new RequestType();
  const evidenceStatement = new EvidenceStatement();

  govUK.initAll();
  expandingTextBox.init();
  sessionInactivity.init();
  detailsToggle.init();
  evidenceStatement.init();

  document
    .querySelectorAll('#buttonBack')
    .forEach((element) => element.addEventListener('click', goBack));
};

domready(onReady);

export { onReady };
