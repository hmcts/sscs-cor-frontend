const { getContentAsString } = require('../core/contentLookup');
const { lowerCase } = require('lodash');

const space = 2;
const tyaNunjucks = {

  nunjucksEnv: null,

  get env() {
    if (!this.nunjucksEnv) {
      throw Error('The nunjucks environment has not been set.');
    }
    return this.nunjucksEnv;
  },

  set env(env) {
    this.nunjucksEnv = env;
  }

};

const filters = {

  json: obj => {
    JSON.stringify(obj, null, space);
  },

  acronym: benefitType => {
    getContentAsString(`benefitTypes.${lowerCase(benefitType)}.acronym`);
  },

  fullDescription: benefitType => {
    getContentAsString(`benefitTypes.${lowerCase(benefitType)}.fullDescription`);
  },

  agency: benefitType => {
    getContentAsString(`benefitTypes.${lowerCase(benefitType)}.agency`);
  },

  agencyAcronym: benefitType => {
    getContentAsString(`benefitTypes.${lowerCase(benefitType)}.agencyAcronym`);
  },

  panel: benefitType => {
    getContentAsString(`benefitTypes.${lowerCase(benefitType)}.panel`);
  }

};

const renderContent = (content, placeholder) => {
  if (Array.isArray(content)) {
    content.map(str => renderContent(str, placeholder));
  }
  if (typeof content === 'object') {
    const newKeys = Object.keys(content).map(key => {
      return { [key]: renderContent(content[key], placeholder) };
    });
    return Object.assign({}, ...newKeys);
  }
  if (typeof content === 'string') {
    return tyaNunjucks.env.renderString(content, placeholder);
  }
  return null;
};

module.exports = { tyaNunjucks, filters, renderContent };
