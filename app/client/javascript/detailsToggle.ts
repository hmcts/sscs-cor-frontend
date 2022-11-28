export class DetailsTabIndexToggle {
  public detailsSelectors: HTMLDetailsElement[];
  init(): void {
    this.detailsSelectors = Array.from(
      document.querySelectorAll('details.govuk-details')
    );
    this.detailsSelectors.forEach((selector) => {
      selector.removeAttribute('role'); // remove role='group' attribute for DAC report

      const detailsText = selector.querySelectorAll('.govuk-details__text a');
      if (selector.open)
        detailsText.forEach((child) => child.removeAttribute('tabindex'));
      else detailsText.forEach((child) => child.setAttribute('tabindex', '-1'));
    });
    this.attachListeners();
  }

  attachListeners(): void {
    this.detailsSelectors.forEach((selector) => {
      const detailsText = selector.querySelector('.govuk-details__text');
      selector.addEventListener('toggle', () =>
        this.toggleAttribute(selector, detailsText)
      );
    });
  }

  toggleAttribute(selector: HTMLDetailsElement, target: Element): any {
    if (selector.open) {
      target
        .querySelectorAll('a')
        .forEach((child) => child.removeAttribute('tabindex'));
    } else {
      target
        .querySelectorAll('a')
        .forEach((child) => child.setAttribute('tabindex', '-1'));
    }
  }
}
