export class ExpandingTextBox {

  constructor() {
    this.attachEventListener();
  }

  autoExpand(event: any): void {
    const target = <HTMLInputElement>event.target;
    $(target).css('height', 'inherit');
    const borderTopWidth = parseInt($(target).css('borderTopWidth').replace('px', ''), 10);
    const borderBottomWidth = parseInt($(target).css('borderBottomWidth').replace('px', ''), 10);
    const height = borderTopWidth + target.scrollHeight + borderBottomWidth;
    $(target).css('height', `${height}px`);
  }
  
  attachEventListener(): void {
    $('textarea.auto-expand').on('input', this.autoExpand);
  }

}