const computedStyle = require('computed-style');

function init(): void {
  attachEventListeners();
}

function autoExpand(event: any): void {
  const target = event.target as HTMLInputElement;
  target.style.height = 'inherit';
  const borderTopWidth = parseInt(computedStyle(target, 'borderTopWidth').replace('px', ''), 10);
  const borderBottomWidth = parseInt(computedStyle(target, 'borderBottomWidth').replace('px', ''), 10);
  const height = borderTopWidth + target.scrollHeight + borderBottomWidth;
  target.style.height = `${height}px`;
}

function attachEventListeners(): void {
  const els = document.querySelectorAll('textarea.auto-expand');
  els.forEach((el) => {
    el.addEventListener('input', (e) => { autoExpand(e); }, false);
  });
}

export {
  init,
  attachEventListeners,
  autoExpand
};
