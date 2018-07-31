const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const chai = require('chai');

const expect = chai.expect;
chai.should();
chai.use(sinonChai);

module.exports = { expect, sinon };
