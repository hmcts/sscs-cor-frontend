import { avEvidenceList } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class AudioVideoEvidencePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = avEvidenceList;
  }
}
