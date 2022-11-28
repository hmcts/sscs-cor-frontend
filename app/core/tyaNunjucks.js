const { getContentAsString } = require('../core/contentLookup');

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
  },
};

const renderContent = (content, placeholder) => {
  if (Array.isArray(content)) {
    content.forEach((str) => renderContent(str, placeholder));
  }
  if (typeof content === 'object') {
    const newKeys = Object.keys(content).map((key) => {
      return { [key]: renderContent(content[key], placeholder) };
    });
    return Object.assign({}, ...newKeys);
  }
  if (typeof content === 'string') {
    return tyaNunjucks.env.renderString(content, placeholder);
  }
  return null;
};

module.exports = { tyaNunjucks, renderContent };
