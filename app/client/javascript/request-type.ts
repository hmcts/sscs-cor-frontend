export class RequestType {

  constructor() {
    this.init();
  }

  init() {
    this.requestOptionSelectEventListeners();
  }

  requestOptionSelectEventListeners(): void {
    const requestOptions = document.querySelector('#request-options');
    if (requestOptions) {
      requestOptions.addEventListener('change', (input: any) => {
        document.forms['request-option-form'].submit();
      });
    }
  }
}
