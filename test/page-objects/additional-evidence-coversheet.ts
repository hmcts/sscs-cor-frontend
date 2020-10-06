import { coversheet } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

const { expect } = require('test/chai-sinon');
const config = require('config');
const testUrl = config.get('testUrl');

export class AdditionalEvidenceCoversheetPage extends BasePage {

    constructor(page){
        super(page);
        this.pagePath = coversheet;
    }

    async navigateToCoverSheetPage(){
        await this.page.goto(`${testUrl}${this.pagePath}`, {waitUntil : 'networkidle2' }).catch(e => void 0);
    }
}