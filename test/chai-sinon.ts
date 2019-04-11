const sinonChai = require('sinon-chai');
const sinon = require('sinon');
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
const chaiString = require('chai-string');

const expect = chai.expect;
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiString);

export { expect, sinon };
