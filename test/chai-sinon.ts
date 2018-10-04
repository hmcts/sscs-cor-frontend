const sinonChai = require('sinon-chai');
const sinon = require('sinon');
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

export { expect, sinon };