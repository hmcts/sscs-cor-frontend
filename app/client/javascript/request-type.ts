export class RequestType {
  constructor() {
    this.init();
  }

  init() {
    this.requestOptionSelectEventListeners();
  }

  requestOptionSelectEventListeners(): void {
    const requestOptions: HTMLSelectElement =
      document.querySelector('#requestOptions');
    if (requestOptions) {
      requestOptions.addEventListener('change', (input: any) => {
        document.forms.namedItem('request-option-form').submit();
      });
    }
  }
}
