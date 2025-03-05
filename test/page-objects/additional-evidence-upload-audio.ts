import * as path from 'path';

import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';
import { expect } from 'test/chai-sinon';
import content from 'app/common/locale/content.json';

export class AdditionalEvidenceUploadAudioVideoPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/uploadAudioVideo`;
  }

  async verifyPages() {
    const title = this.page.title();
    expect(title).to.equal(content.en.additionalEvidence.evidenceUpload.header);
  }

  async selectFile(filename: string) {
    const fileInput = await this.getInputElement(
      '#additional-evidence-audio-video-file'
    );
    const filePath = path.join(__dirname, `/../fixtures/evidence/${filename}`);
    await fileInput.uploadFile(filePath);
  }

  async addDescription(statement: string) {
    await this.setTextintoField('#additional-evidence-description', statement);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-evidences'),
    ]);
  }
}
