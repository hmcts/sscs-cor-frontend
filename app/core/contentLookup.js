const { Logger } = require('@hmcts/nodejs-logging');
const { get } = require('lodash');
const i18n = require('../../locale/content');

const logger = Logger.getLogger('contentLookup.js');

const getContentFromFile = key => {
  const content = get(i18n.en, key);
  if (!content) {
    throw new ReferenceError(`Unknown key: ${key}`);
  }
  return content;
};

const getContentAsString = key => {
  let content = null;
  try {
    content = getContentFromFile(key);
  } catch (error) {
    logger.error(error);
  }

  return content;
};

const getContentAsArray = key => {
  let content = getContentAsString(key);

  if (typeof content === 'string') {
    content = [content];
  }

  return content;
};

module.exports = { getContentFromFile, getContentAsString, getContentAsArray };
