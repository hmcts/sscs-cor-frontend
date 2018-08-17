const $ = require('jquery');

function autoExpand(event) {
  const target = event.target;
  $(target).css('height', 'inherit');
  const borderTopWidth = parseInt($(target).css('borderTopWidth').replace('px', ''), 10);
  const borderBottomWidth = parseInt($(target).css('borderBottomWidth').replace('px', ''), 10);
  const height = borderTopWidth + target.scrollHeight + borderBottomWidth;
  $(target).css('height', `${height}px`);
}

function attachEventListener() {
  $('textarea.auto-expand').on('input', autoExpand);
}

function init() {
  attachEventListener();
}

module.exports = { autoExpand, init };
