import * as $ from 'jquery';

export class ExpandingTextBox {

  constructor() {
    // this.attachEventListener();
  }

  autoExpand(event: JQueryEventObject) {
    const target = event.target;
    $(target).css('height', 'inherit');
    const borderTopWidth = parseInt($(target).css('borderTopWidth').replace('px', ''), 10);
    const borderBottomWidth = parseInt($(target).css('borderBottomWidth').replace('px', ''), 10);
    const height = borderTopWidth + target.scrollHeight + borderBottomWidth;
    $(target).css('height', `${height}px`);
  }

  init(){
    this.attachEventListener();
  }

  attachEventListener() {
    $('textarea.auto-expand').on('input', this.autoExpand);
  }
}