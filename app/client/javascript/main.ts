import * as $ from 'jquery';

import { initAll as GOVUKFrontend } from 'govuk-frontend'
import { ExpandingTextBox } from './expanding-textbox';

$(document).ready(() => {
  GOVUKFrontend();
  const expandingTextBox = new ExpandingTextBox();
  expandingTextBox.init();
});

export default {};