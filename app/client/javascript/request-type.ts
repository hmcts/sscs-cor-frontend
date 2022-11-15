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
        const forms: HTMLCollectionOf<HTMLFormElement> = document.forms;
        forms.namedItem('request-option-form').submit();
      });
    }
  }
}
