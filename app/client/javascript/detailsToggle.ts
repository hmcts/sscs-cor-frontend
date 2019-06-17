export class DetailsTabIndexToggle {
  public detailsSelectors: HTMLDetailsElement[];
  init(): void {
    this.detailsSelectors = Array.from(document.querySelectorAll('details.govuk-details'));
    this.detailsSelectors.forEach(selector => {
      const detailsText = selector.querySelector('.govuk-details__text');
      if (selector.open) detailsText.removeAttribute('tabindex');
      else detailsText.setAttribute('tabindex', '-1');
    });
    this.attachListeners();
  }

  attachListeners(): void {
    this.detailsSelectors.forEach(selector => {
      const detailsText = selector.querySelector('.govuk-details__text');
      selector.addEventListener('toggle', () => this.toggleAttribute(selector, detailsText));
    });
  }

  toggleAttribute(selector: HTMLDetailsElement, target: Element): any {
    if (selector.open) {
      target.removeAttribute('tabindex');
    } else {
      target.setAttribute('tabindex', '-1');
    }
  }
}
