import { supportRepresentatives } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class RepresentativesPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = supportRepresentatives;
  }
}
