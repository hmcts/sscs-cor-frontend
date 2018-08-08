const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

module.exports = { expect, sinon };
